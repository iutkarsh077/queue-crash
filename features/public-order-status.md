# Public order status

The guest opens a public page to see the order. The guest does not log in.

Path: `/o/[orderId]`

## Who uses this feature

The guest uses this feature. The guest scans the QR code or opens the order URL.

## What the page shows

If the order is valid and not expired:

- optional label
- title **Your order**
- large token number
- status chip: **Waiting** or **Ready**
- text **Preparing** or **Your food is ready.**

If the order is not valid or expired, the page shows **Order not found**.

## How the page finds the order

1. Read `orderId` from the path.
2. Check that the ID matches `^[A-Za-z0-9_-]{32}$`.
3. Connect to MongoDB.
4. Find one `Order` where `publicId` matches and `expiresAt` is in the future.
5. Load only `tokenNumber`, `status`, and `label`.

The page does not send `ownerId` or MongoDB `_id` to the guest.

## Status words

| Stored status | Guest chip | Guest text |
| --- | --- | --- |
| `Preparing` | Waiting | Preparing |
| `Ready` | Ready | Your food is ready. |

The page polls the status every 5 seconds. See [web-push.md](web-push.md).

## Access

Anyone with the URL can open the page. The public ID is long and random. Do not put guessable numbers in the path.

## Files

- `src/app/o/[orderId]/page.js`
- `src/app/o/[orderId]/not-found.js`
- `src/lib/order-id.js`
