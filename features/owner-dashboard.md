# Owner dashboard

The dashboard is the owner home after login. Path: `/dashboard`.

## Who uses this feature

The owner uses this feature. A person with no session cannot stay on this page. The proxy sends that person to `/login`.

## What the page shows

1. Greeting with the owner name
2. Title: **Create an order**
3. Create order form (see [create-order.md](create-order.md))
4. List **Today** if the owner has orders for the UTC date
5. **Log out** button

## Today list

The page loads up to 20 orders for:

- `ownerId` = current owner
- `tokenDate` = current UTC date

The list sorts by token number, high to low.

Each row shows:

- token number
- optional label
- status (`Preparing` or `Ready`)

The list does not show the public ID or the QR code. Those items show only after the owner creates an order in the form.

The owner can mark an order **Ready**. The owner can then mark it **Picked up**. See [web-push.md](web-push.md).

## Data source

The page is a Server Component. It reads:

1. Session cookie → `getSessionUser`
2. MongoDB `User` document
3. MongoDB `Order` documents for today

The create form is a Client Component. It posts to `/api/orders`. After create, the new token shows in the form. The Today list updates after a full page load.

## Files

- `src/app/dashboard/page.js`
- `src/components/create-order-panel.js`
- `src/components/guest-shell.js`
