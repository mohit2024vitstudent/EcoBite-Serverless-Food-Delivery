# EcoBite

A responsive EcoBite customer storefront built with HTML5, CSS3 and vanilla JavaScript. It combines prepared meals, Rescue Food and fresh produce in one basket, posts orders to the existing AWS API, and stores customer-submitted demonstration reviews in the browser only.

## Run the demo

1. Serve this folder from a local web server or the deployed HTTPS site. Direct `file://` browsing may fail API CORS checks.
2. Browse the meal menu and **Fresh Picks**. Produce prices are per kg except spinach (per 250 g bunch); quantities count those sale units.
3. Add meals, Rescue Food and produce to one basket. Change quantities or remove items; cart contents persist in `localStorage`.
4. Enter a name, a valid phone number (10–13 digits, optional leading `+`) and a delivery address. Checkout submits to the API Gateway endpoint configured in `app.js`. No payment details are requested and no payment is taken.
5. A successful confirmation requires an HTTP success response containing a server order reference. API errors leave the cart available for retry. The tracking stages remain explicitly simulated.
6. Product review dialogs show clearly labeled sample aggregates. New reviews are saved to this browser only; they are not sent to AWS and are not verified purchases.

The food photos load from publicly accessible Unsplash image URLs. If an image cannot load, the page shows an emoji fallback. A network connection is needed for those photos and the optional Google Fonts; the application itself uses local sample data.

## What's included

- Responsive navigation and layouts for desktop, tablet and mobile.
- Search/category filtering for prepared meals.
- Shared meal, Rescue Food and fresh-produce cart with unit-aware prices, quantity controls, removal, subtotal and ₹40 delivery fee.
- Checkout validation and an eco-friendly packaging preference.
- AWS order submission; Lambda must calculate prices/totals from its server-side catalog.
- Simulated tracking stages: Order placed, Preparing, Out for delivery and Delivered.
- Per-product sample rating summaries and local-only customer reviews.
- Seasonal/sample availability labels and SDG 12/13 messaging without measured-impact claims.
- SDG 12 and SDG 13 sustainability content. Impact statements are labelled illustrative and are not live EcoBite measurements.

## Storage and privacy

The browser stores the basket (`ecobite-demo-cart-v1`), customer reviews (`ecobite-reviews-v1`) and simulated tracking display (`ecobite-simulated-tracking-v1`) in local storage. The checkout does not save a local order fallback: the order must be accepted by the AWS API. Do not enter personal information when the service is not your authorized project environment. Clear this site's local storage to remove local cart/review/tracking data.

## Connect AWS later

The exact API URL is preserved in `app.js`: `https://1r0cv3a963.execute-api.us-east-1.amazonaws.com/orders`. Do not change it unless the deployed API changes. Frontend product IDs/prices/units must match Lambda's `MENU`; Lambda ignores browser names/prices and calculates totals itself.

See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for the complete compatible Python Lambda example, DynamoDB key configuration warning, console deployment steps and end-to-end test checklist. The workspace did not contain the currently deployed Lambda source, so inspect the existing table key and current Lambda order attributes before replacing deployed code. No AWS account changes or live API/DynamoDB tests were performed here.

The frontend does not implement payment, customer authentication, live inventory or live delivery tracking. Configure API Gateway CORS for the actual site origin. No AWS credentials or secrets belong in browser code.
