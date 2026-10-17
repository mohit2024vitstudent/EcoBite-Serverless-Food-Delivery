# EcoBite AWS order integration and deployment

## Current integration contract

The frontend keeps this API URL unchanged:

`https://1r0cv3a963.execute-api.us-east-1.amazonaws.com/orders`

It sends `POST` JSON with `customer` (`name`, `phone`, `address`), `items` (`id`, integer `quantity`, plus display metadata), and `ecoPackaging`. Browser item names and prices are never trusted by the Lambda. The Lambda must return an HTTP success response containing a server-created `orderReference` (or `orderId`); otherwise the page shows an error and does not show confirmation or clear the cart.

The nine fresh IDs and sale units/prices are:

| ID | Catalog price | Sale unit |
| --- | ---: | --- |
| `fresh-apple-kg` | ₹180 | kg |
| `fresh-banana-kg` | ₹60 | kg |
| `fresh-orange-kg` | ₹120 | kg |
| `fresh-mango-kg` | ₹160 | kg |
| `fresh-tomato-kg` | ₹40 | kg |
| `fresh-potato-kg` | ₹35 | kg |
| `fresh-onion-kg` | ₹45 | kg |
| `fresh-carrot-kg` | ₹60 | kg |
| `fresh-spinach-bunch` | ₹35 | 250 g bunch |

A cart quantity is the count of its displayed sale unit (e.g. quantity `2` of apples is 2 kg, quantity `2` of spinach is two 250 g bunches). The frontend also retains all existing dish and Rescue Food IDs/prices. Confirm the existing Lambda has the same dishes/prices before deploying the provided full handler.

## Important: check the existing DynamoDB key before deploy

The VS Code workspace did not contain the current Python Lambda source, and I cannot access the AWS account. The provided `lambda_function.py` is a complete reference handler, not a verified patch against the deployed function. It preserves common order attributes (`orderReference`, `customer`, `items`, `subtotal`, `deliveryFee`, `total`, `ecoPackaging`, `createdAt`) and does not ask for a table migration, but the actual `EcoBiteOrders` partition/sort key names were not present in the workspace.

Before deployment, open **DynamoDB → Tables → EcoBiteOrders → Overview** and note the exact partition key and, if present, sort key. Set these Lambda environment variables to match the existing schema:

- `ORDERS_TABLE`: `EcoBiteOrders`
- `ORDER_PARTITION_KEY`: exact existing partition-key attribute name (the example defaults to `orderId`)
- `ORDER_SORT_KEY`: exact existing sort-key attribute name if the table has one; omit/leave empty if there is no sort key. The handler writes the order's ISO `createdAt` value to a configured sort-key attribute.
- `CORS_ALLOW_ORIGIN`: your deployed website origin, for example `https://your-site.example`; use `*` only for a public demo without credentialed requests.

The Lambda execution role needs CloudWatch Logs permissions and `dynamodb:PutItem` on the existing table. Do not alter the table keys or delete/migrate existing items. If the current handler has additional order fields or validation your project relies on, merge the `MENU` entries and authoritative item-pricing logic into that deployed code rather than blindly replacing it.

## Deploy the reference Python Lambda in AWS Console

1. Keep a backup of the working Lambda code/configuration and current API test result.
2. Confirm the table key attributes as described above. Confirm that the current `EcoBiteOrders` table has no other required attributes beyond its configured keys.
3. In **Lambda → Functions → EcoBiteOrderFunction**, verify the execution role can write to `EcoBiteOrders`. Add only a least-privilege `dynamodb:PutItem` permission for this table if it is missing.
4. In the **Code** tab, open `lambda_function.py` from this workspace, copy the complete content into the console editor (or upload it as a ZIP containing `lambda_function.py`), and save. Set the handler to `lambda_function.lambda_handler` and use a Python 3.12 runtime. `boto3` is available in the managed Python runtime; no third-party package is required.
5. Under **Configuration → Environment variables**, configure the key/table/CORS values from the previous section. For a table with a sort key, set `ORDER_SORT_KEY` exactly; for a partition-only table, leave it blank.
6. Deploy the function. In the Lambda **Test** tab, use a valid event body such as:

   ```json
   {
     "body": "{\"customer\":{\"name\":\"Test Customer\",\"phone\":\"9876543210\",\"address\":\"12 Green Road, Pune\"},\"items\":[{\"id\":\"fresh-apple-kg\",\"quantity\":2}],\"ecoPackaging\":true}"
   }
   ```

   This test writes a real item to DynamoDB. Only run it in the intended project table; then verify the item and generated `orderReference` in **DynamoDB → Explore items**. The reference handler uses catalog prices (2 × ₹180 + ₹40 delivery = ₹400) and ignores any client-supplied price/total.
7. In **API Gateway → APIs → your HTTP API**, verify that `POST /orders` is integrated with `EcoBiteOrderFunction`, the `$default` stage (or current stage) is deployed/auto-deploying, and the route still uses Lambda proxy integration.
8. Under HTTP API **CORS**, allow the actual site origin, method `POST` (and `OPTIONS` where the console requires it), and header `Content-Type`. Save/deploy the API configuration. Do not enable credentialed cross-origin requests for wildcard origin.
9. Confirm the endpoint is still `https://1r0cv3a963.execute-api.us-east-1.amazonaws.com/orders`. Load the frontend over HTTP(S) from its actual origin; opening the HTML with `file://` may be blocked by browser CORS.

The Lambda's CORS response also includes headers, but configure CORS on the HTTP API itself because API Gateway may handle preflight responses before invoking Lambda.

## Deployment and verification checklist

- [ ] Compare every frontend product ID against the deployed Lambda `MENU`; all nine fresh IDs above must exist, and all original meal/rescue IDs must remain.
- [ ] Confirm every listed unit/price is identical in `app.js` and Lambda. Do not accept browser-provided unit prices as authoritative.
- [ ] Place a prepared meal order from the site. Verify the success reference is returned by Lambda and the matching order is visible in `EcoBiteOrders`.
- [ ] Place a fresh-produce order (e.g. quantity 2 of `fresh-apple-kg`). Verify the stored item uses server price ₹180/kg, quantity 2, line total ₹360, delivery fee ₹40, total ₹400.
- [ ] Place a mixed order with one meal and one produce item. Check that the one server-calculated subtotal and ₹40 delivery fee include both lines correctly.
- [ ] Place a Rescue Food order to confirm the existing discounted product ID still works.
- [ ] Confirm bad phone/address, unknown item IDs, and invalid quantities return an error; the UI must not show success or clear the cart.
- [ ] Simulate an API error/offline request and verify the cart remains and checkout can be retried. Check that rapid repeat submission produces only one request.
- [ ] Submit a review and refresh; verify the rating/count and review persist in local storage only. Verify the review is visibly marked as browser-submitted and not verified.
- [ ] Advance order tracking and confirm the interface still labels it simulated; this does not update DynamoDB.
- [ ] Confirm no card details are requested and no payment is taken.

No AWS deployment or live DynamoDB/API test was run from this workspace. Do not treat the checklist as completed until you perform it in your account.
