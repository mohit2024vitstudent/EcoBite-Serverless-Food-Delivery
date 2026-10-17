"""EcoBite POST /orders Lambda (Python 3.12, boto3 provided by Lambda runtime).

Deployment note: configure ORDER_PARTITION_KEY (and, if required,
ORDER_SORT_KEY) to match the existing EcoBiteOrders table's current key schema.
This handler deliberately does not change that schema. It retains the customer,
items, subtotal, deliveryFee, total, ecoPackaging and orderReference attributes.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ.get("ORDERS_TABLE", "EcoBiteOrders")
# Set to the actual existing table partition key. Default assumes orderId.
PARTITION_KEY = os.environ.get("ORDER_PARTITION_KEY", "orderId")
# Leave unset for a table without a sort key. If the current table has a sort
# key, set ORDER_SORT_KEY to its attribute name; createdAt is written below.
SORT_KEY = os.environ.get("ORDER_SORT_KEY", "").strip()
DELIVERY_FEE = 40
MAX_LINE_QUANTITY = 99

# Prices are INR for one displayed sale unit. These IDs and existing dish prices
# must remain aligned with app.js. Never use prices or names sent by the browser.
MENU: dict[str, dict[str, Any]] = {
    # Existing prepared meal IDs and prices (preserved).
    "paneer-bowl": {"name": "Paneer Tikka Bowl", "price": 249, "unit": "per serving", "productType": "meal"},
    "rainbow-salad": {"name": "Rainbow Harvest Salad", "price": 219, "unit": "per serving", "productType": "meal"},
    "masala-dosa": {"name": "Crispy Masala Dosa", "price": 179, "unit": "per serving", "productType": "meal"},
    "veggie-burger": {"name": "Garden Veggie Burger", "price": 199, "unit": "per serving", "productType": "meal"},
    "margherita-pizza": {"name": "Margherita Pizza", "price": 279, "unit": "per serving", "productType": "meal"},
    "dal-khichdi": {"name": "Comfort Dal Khichdi", "price": 189, "unit": "per serving", "productType": "meal"},
    "mango-cheesecake": {"name": "Mango Cheesecake", "price": 149, "unit": "per serving", "productType": "meal"},
    "brownie": {"name": "Fudgy Chocolate Brownie", "price": 119, "unit": "per serving", "productType": "meal"},
    # Existing Rescue Food IDs and discounted prices (preserved).
    "rescue-wrap": {"name": "Roasted Veggie Wrap", "price": 119, "unit": "per serving", "productType": "rescue"},
    "rescue-bowl": {"name": "Seasonal Harvest Bowl", "price": 149, "unit": "per serving", "productType": "rescue"},
    # Fresh market products. Each quantity is a count of the stated sale unit.
    "fresh-apple-kg": {"name": "Apples", "price": 180, "unit": "per kg", "productType": "produce"},
    "fresh-banana-kg": {"name": "Bananas", "price": 60, "unit": "per kg", "productType": "produce"},
    "fresh-orange-kg": {"name": "Oranges", "price": 120, "unit": "per kg", "productType": "produce"},
    "fresh-mango-kg": {"name": "Mangoes", "price": 160, "unit": "per kg", "productType": "produce"},
    "fresh-tomato-kg": {"name": "Tomatoes", "price": 40, "unit": "per kg", "productType": "produce"},
    "fresh-potato-kg": {"name": "Potatoes", "price": 35, "unit": "per kg", "productType": "produce"},
    "fresh-onion-kg": {"name": "Onions", "price": 45, "unit": "per kg", "productType": "produce"},
    "fresh-carrot-kg": {"name": "Carrots", "price": 60, "unit": "per kg", "productType": "produce"},
    "fresh-spinach-bunch": {"name": "Spinach", "price": 35, "unit": "per 250 g bunch", "productType": "produce"},
}


def _cors_headers() -> dict[str, str]:
    # Prefer to configure the same allow-list in API Gateway HTTP API CORS.
    # For a public college demo, '*' is acceptable only if no credentials are used.
    return {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": os.environ.get("CORS_ALLOW_ORIGIN", "*"),
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
    }


def _response(status_code: int, payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": _cors_headers(),
        "body": json.dumps(payload, ensure_ascii=False, default=str),
    }


def _read_body(event: dict[str, Any]) -> dict[str, Any]:
    body = event.get("body")
    if body is None and isinstance(event.get("items"), list):
        # Allows direct Lambda console test events as well as API Gateway events.
        return event
    if not isinstance(body, str):
        raise ValueError("Request body must be JSON.")
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    parsed = json.loads(body)
    if not isinstance(parsed, dict):
        raise ValueError("Request body must be a JSON object.")
    return parsed


def _customer_from(payload: dict[str, Any]) -> dict[str, str]:
    raw_customer = payload.get("customer")
    customer = raw_customer if isinstance(raw_customer, dict) else payload
    name = str(customer.get("name", "")).strip()
    phone = re.sub(r"[\s()-]", "", str(customer.get("phone", "")))
    address = str(customer.get("address", "")).strip()
    if len(name) < 2 or len(name) > 100:
        raise ValueError("Enter a name between 2 and 100 characters.")
    if not re.fullmatch(r"\+?[0-9]{10,13}", phone):
        raise ValueError("Enter a valid phone number with 10 to 13 digits.")
    if len(address) < 8 or len(address) > 500:
        raise ValueError("Enter a delivery address between 8 and 500 characters.")
    return {"name": name, "phone": phone, "address": address}


def _priced_items(raw_items: Any) -> tuple[list[dict[str, Any]], int]:
    if not isinstance(raw_items, list) or not raw_items:
        raise ValueError("Add at least one item to your order.")
    if len(raw_items) > 50:
        raise ValueError("An order can contain at most 50 distinct products.")

    items: list[dict[str, Any]] = []
    subtotal = 0
    for raw_item in raw_items:
        if not isinstance(raw_item, dict):
            raise ValueError("Each order item must be an object.")
        item_id = str(raw_item.get("id", raw_item.get("itemId", ""))).strip()
        catalog_item = MENU.get(item_id)
        if catalog_item is None:
            raise ValueError(f"Unknown product ID: {item_id or '(missing)'}.")
        quantity = raw_item.get("quantity")
        if isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= MAX_LINE_QUANTITY:
            raise ValueError(f"Quantity for {catalog_item['name']} must be a whole number from 1 to {MAX_LINE_QUANTITY}.")

        unit_price = int(catalog_item["price"])
        line_total = unit_price * quantity
        subtotal += line_total
        items.append({
            "id": item_id,
            "name": catalog_item["name"],
            "quantity": quantity,
            "unitPrice": unit_price,
            "unit": catalog_item["unit"],
            "productType": catalog_item["productType"],
            "lineTotal": line_total,
        })
    return items, subtotal


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod", "POST")
    ).upper()
    if method == "OPTIONS":
        return {"statusCode": 204, "headers": _cors_headers(), "body": ""}
    if method != "POST":
        return _response(405, {"message": "Method not allowed."})

    try:
        payload = _read_body(event)
        customer = _customer_from(payload)
        items, subtotal = _priced_items(payload.get("items"))
        delivery_fee = DELIVERY_FEE
        order_reference = f"EB-{uuid.uuid4().hex[:10].upper()}"
        created_at = datetime.now(timezone.utc).isoformat()

        # Keep the existing top-level order fields and add unit metadata to each
        # line. Browser-supplied names, prices, totals and references are ignored.
        order: dict[str, Any] = {
            "orderId": order_reference,
            "orderReference": order_reference,
            "customer": customer,
            "items": items,
            "subtotal": subtotal,
            "deliveryFee": delivery_fee,
            "total": subtotal + delivery_fee,
            "ecoPackaging": bool(payload.get("ecoPackaging", False)),
            "status": "Order placed",
            "createdAt": created_at,
        }
        order[PARTITION_KEY] = order_reference
        if SORT_KEY:
            order[SORT_KEY] = created_at

        table = boto3.resource("dynamodb").Table(TABLE_NAME)
        table.put_item(Item=order)
        return _response(201, {
            "message": "Order placed successfully.",
            "orderReference": order_reference,
            "subtotal": subtotal,
            "deliveryFee": delivery_fee,
            "total": subtotal + delivery_fee,
            "order": order,
        })
    except ValueError as exc:
        return _response(400, {"message": str(exc)})
    except Exception:
        logger.exception("EcoBite order submission failed")
        return _response(500, {"message": "We could not save your order. Please try again."})
