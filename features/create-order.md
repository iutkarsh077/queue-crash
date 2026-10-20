# Create order

The owner creates an order. The application makes a daily token and a QR code. The guest scans the QR code to open the order page.

## Who uses this feature

The owner uses this feature on `/dashboard`. The owner must be logged in.

## What the owner does

1. The owner types an optional label (example: `Table 4`).
2. The owner selects **Create order**.
3. The page shows the token, the status, the order URL, and the QR code.
4. The owner can select **Download QR code** to save a PNG file.

## What the API does

Route: `POST /api/orders`

1. Check that the owner is logged in.
2. Read the JSON body. Use only the `label` field.
3. Clean the label. Trim space. Limit length to 40 characters.
4. Connect to MongoDB.
5. Allocate the next daily token for this owner.
6. Make a random public order ID (32 characters).
7. Save the order with status `Preparing`.
8. Build the public URL: `{origin}/o/{publicId}`.
9. Make a QR code image as a data URL.
10. Return JSON to the dashboard.

The owner must not send `tokenNumber`, `status`, or `orderId`. If the body has these fields, the API returns status 400.

## Daily token

Each owner has a counter for each UTC date.

1. The application finds or creates a `DailyCounter` row for `(ownerId, date)`.
2. The application increases `seq` by 1.
3. The new `seq` is the token number.

The token starts at 1 each UTC day. Owner A and owner B can have the same token number on the same day.

If two creates collide on `(ownerId, tokenDate, tokenNumber)`, the API tries again up to 3 times.

## Public order ID

The public ID is 24 random bytes in Base64url. The length is 32 characters. The guest cannot guess this ID.

The application does not put the MongoDB `_id` in the QR code.

## QR code

The QR code contains the full public URL. Colors:

- Dark modules: `#0A0A0A`
- Light modules: `#FFFFFF`

Size: 320 px. Error correction: M.

If QR creation fails, the order is still saved. The API still returns the token and the URL. The API also returns an error text.

## Order lifetime

The order expires 3 hours after create. An open order older than 3 hours becomes **Expired**.

## Origin for the URL

The application sets the public origin in this order:

1. `APP_URL` if it is set
2. Vercel production host if `VERCEL_ENV` is `production`
3. Request host (`x-forwarded-host` or `host`)

## JSON that the API returns

Success:

- `tokenNumber`
- `status`
- `label`
- `orderUrl`
- `qrDataUrl`
- `createdAt`

Errors:

| Status | When |
| --- | --- |
| 401 | The owner is not logged in |
| 400 | The label is not valid, or the body has forbidden fields |
| 409 | Token conflict after retries |
| 500 | Save failed |

## Files

- `src/components/create-order-panel.js`
- `src/app/api/orders/route.js`
- `src/lib/tokens.js`
- `src/lib/order-id.js`
- `src/lib/qr.js`
- `src/lib/app-origin.js`
- `src/models/Order.js`
- `src/models/DailyCounter.js`

## Limits

- The owner marks **Ready** and **Picked up** on the dashboard.
- This version does not let the owner delete an order.
- The PNG download uses the data URL in the browser. The application does not store the PNG in MongoDB.
