# Session

The session tells the application who the owner is. The session is a cookie. The cookie name is `session`.

## What the cookie contains

The cookie value has two parts:

1. A Base64url payload with `{ userId }`
2. An HMAC-SHA256 signature

Example form:

`payload.signature`

`userId` is the MongoDB `_id` of the `User` document.

## Cookie rules

| Rule | Value |
| --- | --- |
| Name | `session` |
| HttpOnly | yes |
| SameSite | `lax` |
| Path | `/` |
| Secure | yes in production |
| Max age | 7 days after login |

The browser cannot read this cookie in JavaScript.

## How the application uses the session

1. The login callback writes the cookie.
2. `getSessionUser` reads the cookie.
3. The function checks the signature.
4. The function loads the `User` document from MongoDB.
5. If the user is missing, the session is not valid.

`requireOwner` uses the same check. API routes that change owner data must call `requireOwner`.

## Log out

1. The owner opens `/api/auth/logout`.
2. The application deletes the `session` cookie.
3. The application sends the owner to `/login`.

## Files

- `src/lib/session.js`
- `src/lib/auth.js`
- `src/app/api/auth/logout/route.js`

## Limits

- The application must have `SESSION_SECRET`.
- The application does not store sessions in MongoDB.
- If the owner deletes the user document, the cookie is not valid.
