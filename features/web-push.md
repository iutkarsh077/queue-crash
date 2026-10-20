# Food-ready web push

When an owner marks an order **Ready**, the guest can get a web push notification.

The guest still sees **Ready** on the open order page if push does not arrive.

## Who uses this feature

- The guest taps **Notify me** on `/o/[orderId]`.
- The owner taps **Ready** on `/dashboard`.

The guest does not log in. The application does not store a name, email, or phone number for the guest.

## Guest flow

1. The guest opens the order page from the QR code.
2. The page shows the token and the status.
3. If the browser can use web push, the guest taps **Notify me**.
4. The browser asks for notification permission.
5. The page registers `/sw.js`.
6. The page sends the subscription to `POST /api/o/[orderId]/subscribe`.
7. The server saves the subscription on that order only.
8. The page shows: **We will notify you when your food is ready.**

The page does not say that notifications are on until the server saves the subscription.

After **Notify me**, the service worker shows a test system notification: **Alerts are on. You will hear this when food is ready.**

If the guest does not hear that test, the Chrome or Queue notification channel is muted. The page tells the guest to open **Settings**, then **Apps**, then **Chrome** or **Queue**, then **Notifications**, and turn sound on.

The page does not play the in-page beep for that test.

## Live status fallback

The page reads `GET /api/o/[orderId]/status` every 5 seconds.

If push is not available, or the guest denies permission, the page shows:

**Keep this page open - it will show Ready and beep**

When status changes from **Preparing** to **Ready** on an open page, the page asks the service worker to show the same system notification as a closed-app push. The page plays the in-page beep only if that system notification cannot show and the page is visible.

The page does not play the in-page beep when the guest opens an order that is already **Ready**. Closed-app sound comes from the phone notification, not from Web Audio.

On iPhone, web push works only after the guest adds the site to the Home Screen and opens that app. The page says:

**On iPhone, add this site to your Home Screen. Then open the app and tap Notify me.**

The page does not promise push on iPhone without that step.

Polling stops when the order is **Picked up**, **Expired**, or the page is closed.

## Owner flow

1. The owner logs in.
2. The owner taps **Ready** on an order that is **Preparing**.
3. The server sets status to **Ready** and sets `readyAt`.
4. The server sends push to subscriptions for that order.
5. The notification text is: `Your food is ready - token <tokenNumber>`.

If the owner taps **Ready** again, the server does not send a second notification.

A push failure does not undo **Ready**.

The owner taps **Picked up** to close the order. The server deletes all subscriptions for that order.

## Expiry

An open order older than three hours becomes **Expired**. The server deletes its subscriptions.

A Vercel Cron job calls `GET /api/cron/expire-orders` once per day. The request must send:

`Authorization: Bearer <CRON_SECRET>`

The live order page also expires a stale order when it loads or polls. The job can run more than once.

## Environment

The guest must tap **Notify me** once. That is the web permission for background alerts. A website cannot take Android “run in background” like a native app.

After **Notify me**, Chrome can send a food-ready push notification while the app is closed. Sound and vibration follow the phone **notification** channel for Chrome or the installed app. The page cannot set a custom vibrate pattern on Android 8 and later. If sound works but vibrate does not, turn vibration on for Chrome or Queue notifications.

A website cannot take Android “run in background” like a native app. The page cannot play Web Audio after the guest swipes the app away.

Keep notification sound on for Chrome or Queue. Do not use Do Not Disturb for that channel.

The server sends Ready push with high urgency and a TTL of three hours.

The PWA starts at `/`. The last scanned order id is stored in `localStorage` as `queue.lastOrderId`. Opening the installed app sends the guest back to that order.

Guests must scan a QR on the same host as the installed app. For production use:

`APP_URL=https://queue-crash.vercel.app`

Set these values in local `.env` and in Vercel:

| Name | Where | Use |
| --- | --- | --- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Client and server | Push subscribe |
| `VAPID_PRIVATE_KEY` | Server only | Push send |
| `VAPID_SUBJECT` | Server only | `mailto:` or `https://queue-crash.vercel.app` |
| `CRON_SECRET` | Server only | Cron job auth |
| `APP_URL` | Server only | Public origin for QR codes |

Make keys with:

`npx web-push generate-vapid-keys`

Do not put `VAPID_PRIVATE_KEY` in client code, logs, or browser responses.

The server fails at start if VAPID settings are missing (`src/instrumentation.js`).

## Vercel Cron

File: `vercel.json`

Path: `/api/cron/expire-orders`

Schedule: `0 0 * * *` (once per day, 00:00 UTC)

This matches the Vercel Hobby limit of one cron run per day. The live page still expires a stale order when a guest opens or polls the page. The daily job cleans orders that no person opened.

## Files

- `public/sw.js`
- `public/manifest.webmanifest`
- `src/models/PushSubscription.js`
- `src/app/api/o/[orderId]/subscribe/route.js`
- `src/app/api/o/[orderId]/status/route.js`
- `src/app/api/orders/[id]/route.js`
- `src/app/api/cron/expire-orders/route.js`
- `src/components/order-live-card.js`
- `src/components/owner-order-list.js`
- `src/lib/last-order.js`
- `src/components/home-boot.js`
- `public/icon-192.png`
- `public/icon-512.png`
