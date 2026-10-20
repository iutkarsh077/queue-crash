# Data flow spec

This spec shows where data comes from and where data goes. Use this file to follow data through the application.

Actors:

- **owner**: restaurant or barber staff
- **guest**: person who waits
- **Google**: login provider
- **MongoDB**: data store
- **browser**: cookies, forms, QR download

## 1. Stores

### 1.1 Environment

| Name | Flows into |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google login URL and token request |
| `GOOGLE_CLIENT_SECRET` | Google token request |
| `REDIRECT_URI` | Google login URL and token request |
| `SESSION_SECRET` | Session cookie sign and check |
| `DATABASE_URI` | All MongoDB reads and writes |
| `APP_URL` | Public order URL (if set) |
| `VERCEL_ENV` | Public origin on Vercel |
| `VERCEL_PROJECT_PRODUCTION_URL` | Public origin in production |
| `NODE_ENV` | Secure cookie and HTTPS default |

Do not put secrets in the browser.

### 1.2 Cookies

| Cookie | Writer | Reader | Payload |
| --- | --- | --- | --- |
| `oauth_state` | `/api/auth/google` | `/api/auth/callback/google` | Random hex `state` |
| `session` | `/api/auth/callback/google` | proxy, pages, `/api/orders` | `{ userId }` plus HMAC |

`oauth_state` lives 10 minutes. `session` lives 7 days. Both cookies are HttpOnly.

### 1.3 MongoDB collections

**User**

| Field | In | Out |
| --- | --- | --- |
| `_id` | MongoDB | session cookie, `ownerId` on orders |
| `googleId` | Google `sub` | login lookup |
| `email` | Google | dashboard identity |
| `name` | Google | dashboard greeting |
| `picture` | Google | stored, not shown in this version |

**DailyCounter**

| Field | In | Out |
| --- | --- | --- |
| `ownerId` | session user `_id` | token allocation |
| `date` | UTC date `YYYY-MM-DD` | token allocation |
| `seq` | `$inc: 1` | `Order.tokenNumber` |

**Order**

| Field | In | Out |
| --- | --- | --- |
| `publicId` | random 32-character ID | QR URL, guest path |
| `ownerId` | session user `_id` | dashboard Today list |
| `tokenNumber` | `DailyCounter.seq` | dashboard, QR UI, guest page |
| `tokenDate` | UTC date | dashboard Today filter |
| `status` | `Preparing` on create | dashboard, guest page, push |
| `readyAt` | set when status becomes `Ready` | not shown |
| `label` | owner form | dashboard, guest page |
| `readyAt` | null on create | not shown |
| `expiresAt` | create time + 24 hours | guest page filter |
| `createdAt` | MongoDB | API JSON |

**PushSubscription**

| Field | In | Out |
| --- | --- | --- |
| `orderId` | order MongoDB `_id` | push send and cleanup |
| `endpoint` | browser Push API | web-push send |
| `p256dh` | browser Push API | web-push send |
| `auth` | browser Push API | web-push send |

Unique indexes:

- `User.googleId`
- `Order.publicId`
- `DailyCounter` on `(ownerId, date)`
- `Order` on `(ownerId, tokenDate, tokenNumber)`
- `PushSubscription` on `(orderId, endpoint)`

## 2. Request map

```
Browser
  |  GET /login
  |  GET /api/auth/google
  v
Google accounts
  |  GET /api/auth/callback/google?code&state
  v
API callback --> MongoDB User --> session cookie --> /dashboard
  |
  |  POST /api/orders  { label }
  v
API orders --> DailyCounter --> Order --> QR data URL --> dashboard UI
  |
  |  guest opens /o/{publicId}
  v
Guest page --> MongoDB Order (public fields only)
```

## 3. Flow: log in

Start: owner on `/login`.

| Step | From | To | Data |
| --- | --- | --- | --- |
| 1 | Browser | `src/proxy.js` | path `/login`, optional `session` cookie |
| 2 | Login page | `getSessionUser` | `session` cookie |
| 3 | Owner click | `/api/auth/google` | none |
| 4 | Google route | Browser cookie | `oauth_state` |
| 5 | Google route | Google | `client_id`, `redirect_uri`, `scope`, `state` |
| 6 | Google | Callback | `code`, `state` |
| 7 | Callback | Cookie store | compare `state` to `oauth_state` |
| 8 | Callback | Google token URL | `code`, client id, client secret, redirect URI |
| 9 | Google | Callback | `access_token` |
| 10 | Callback | Google userinfo | Bearer token |
| 11 | Google | Callback | `sub`, `email`, `name`, `picture` |
| 12 | Callback | MongoDB `User` | upsert by `googleId` |
| 13 | MongoDB | Callback | `_id` |
| 14 | Callback | Browser | `session` cookie with signed `_id` |
| 15 | Callback | Browser | redirect `/dashboard` |

The access token stays on the server for one request. The application does not save it.

Fail path: any failed check → redirect `/login?error=1` and delete `oauth_state`.

## 4. Flow: open dashboard

Start: owner on `/dashboard`.

| Step | From | To | Data |
| --- | --- | --- | --- |
| 1 | Browser | `src/proxy.js` | `session` cookie presence |
| 2 | Dashboard | `getSessionUser` | cookie → `{ userId }` |
| 3 | Auth helper | MongoDB `User` | find by `_id` |
| 4 | User document | Page | `id`, `name`, `email`, `picture` |
| 5 | Page | MongoDB `Order` | `ownerId`, `tokenDate` = UTC today |
| 6 | Order documents | Page | `tokenNumber`, `status`, `label` (max 20) |

If `userId` is not valid, the page shows **You are not logged in.**

## 5. Flow: create order

Start: owner submits the form on `/dashboard`.

| Step | From | To | Data |
| --- | --- | --- | --- |
| 1 | `CreateOrderPanel` | `POST /api/orders` | JSON `{ label }` |
| 2 | API | `requireOwner` | `session` cookie |
| 3 | Auth helper | MongoDB `User` | owner `id` |
| 4 | API | `cleanLabel` | string, max 40 characters |
| 5 | API | `DailyCounter` | `$inc seq` for `(ownerId, UTC date)` |
| 6 | Counter | API | `tokenNumber`, `tokenDate` |
| 7 | API | `createPublicOrderId` | 32-character `publicId` |
| 8 | API | MongoDB `Order` | full order document |
| 9 | Request headers | `getPublicAppOrigin` | `APP_URL` or host headers |
| 10 | API | string | `orderUrl` = origin + `/o/` + `publicId` |
| 11 | API | `qrcode` | PNG data URL |
| 12 | API | Browser | JSON token, status, label, URL, QR |

The form keeps this JSON in React state. Download PNG reads `qrDataUrl` in the browser. MongoDB does not store the QR image.

Today list on the dashboard does not read this JSON. That list reads MongoDB on page load.

## 6. Flow: guest order page

Start: guest scans the QR code.

| Step | From | To | Data |
| --- | --- | --- | --- |
| 1 | QR / URL | Browser | `/o/{publicId}` |
| 2 | Page | `isValidPublicOrderId` | path param |
| 3 | Page | MongoDB `Order` | `publicId`, `expiresAt > now` |
| 4 | Order document | Page | `tokenNumber`, `status`, `label` |

If the ID is not valid, or the order is missing, or the order is expired, the page shows not-found.

No session is required.

## 7. Flow: log out

| Step | From | To | Data |
| --- | --- | --- | --- |
| 1 | Dashboard | `/api/auth/logout` | GET |
| 2 | Logout route | Browser | delete `session` |
| 3 | Logout route | Browser | redirect `/login` |

MongoDB does not change. The User document stays.

## 8. Origin for public URLs

Function: `getPublicAppOrigin`.

```
APP_URL set?
  yes --> use APP_URL (no trailing slash)
  no  --> VERCEL_ENV is production and host is set?
            yes --> https://{VERCEL_PROJECT_PRODUCTION_URL}
            no  --> {x-forwarded-proto or http/https}://{x-forwarded-host or host}
```

This origin goes only into `orderUrl` and the QR code. Pages do not store it.

## 9. Flow: notify me and Ready

| Step | From | To | Data |
| --- | --- | --- | --- |
| 1 | Guest | `POST /api/o/{publicId}/subscribe` | `endpoint`, `p256dh`, `auth` |
| 2 | Subscribe route | MongoDB `PushSubscription` | one row per order and endpoint |
| 3 | Owner | `PATCH /api/orders/{mongoId}` | `{ status: "Ready" }` |
| 4 | API | MongoDB `Order` | `Ready` and `readyAt` |
| 5 | API | web-push | payload for that order only, urgency high, TTL 3 hours |
| 6 | Service worker | Guest device | `Your food is ready - token N` |
| 7 | Guest page | `GET /api/o/{publicId}/status` | token, status, label every 5 seconds |

A second Ready request does not send push. HTTP 404 or 410 from the push service deletes that subscription.

After **Notify me**, the guest page shows a test system notification. The guest page does not play the in-page beep when it opens on an order that is already Ready.

## 10. What does not flow yet

- `User.picture` is saved and not shown
- The application does not store guest names, email, or phone numbers

No API lists orders for a guest. The guest knows only the public URL.

## 11. File map

| Concern | Files |
| --- | --- |
| Login start | `src/app/api/auth/google/route.js`, `src/lib/google.js` |
| Login finish | `src/app/api/auth/callback/google/route.js` |
| Session | `src/lib/session.js`, `src/lib/auth.js` |
| Log out | `src/app/api/auth/logout/route.js` |
| Route guard | `src/proxy.js` |
| Database connect | `src/lib/db.js` |
| Models | `src/models/User.js`, `src/models/Order.js`, `src/models/DailyCounter.js`, `src/models/PushSubscription.js` |
| Create order | `src/app/api/orders/route.js`, `src/components/create-order-panel.js` |
| Token and ID | `src/lib/tokens.js`, `src/lib/order-id.js` |
| QR and origin | `src/lib/qr.js`, `src/lib/app-origin.js` |
| Owner UI | `src/app/login/page.js`, `src/app/dashboard/page.js` |
| Guest UI | `src/app/o/[orderId]/page.js`, `src/app/o/[orderId]/not-found.js`, `src/components/order-live-card.js` |
| Owner Ready | `src/app/api/orders/[id]/route.js`, `src/components/owner-order-list.js` |
| Web push | `src/lib/push.js`, `src/lib/vapid.js`, `public/sw.js` |
| Expiry cron | `src/app/api/cron/expire-orders/route.js`, `vercel.json` |
