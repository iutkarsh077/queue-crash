# Google login

The owner logs in with Google. The application uses Next.js API routes. The application does not use NextAuth.

## Who uses this feature

The owner uses this feature. A guest does not log in.

## What the owner sees

1. The owner opens `/login`.
2. The page shows one green button: **Log in with Google**.
3. If login fails, the page shows: **Login failed. Try again.**

## How login works

1. The owner opens `/api/auth/google`.
2. The application makes a random `state` value.
3. The application saves `state` in the `oauth_state` cookie for 10 minutes.
4. The application sends the owner to Google.
5. Google sends the owner to `/api/auth/callback/google` with a `code` and a `state`.
6. The application checks that the `state` matches the cookie.
7. The application sends the `code` to Google and gets the owner profile.
8. The application saves the owner in MongoDB.
9. The application sets the `session` cookie.
10. The application deletes the `oauth_state` cookie.
11. The application sends the owner to `/dashboard`.

If a check fails, the application sends the owner to `/login?error=1`.

## Data that Google sends

The application reads these fields from Google:

- `sub` (Google user ID)
- `email`
- `name`
- `picture`

The application must have `sub` and `email`. If one of these is missing, login fails.

## Data that MongoDB saves

The `User` document stores:

| Field | Source |
| --- | --- |
| `googleId` | Google `sub` |
| `email` | Google email |
| `name` | Google name |
| `picture` | Google picture URL |

If the owner logs in again, the application updates the same document. The application finds the document by `googleId`.

## Environment values

| Name | Use |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google client ID |
| `GOOGLE_CLIENT_SECRET` | Google client secret |
| `REDIRECT_URI` | Google callback URL |
| `SESSION_SECRET` | Signature for the session cookie |
| `DATABASE_URI` | MongoDB connection |

Local callback URL:

`http://localhost:3000/api/auth/callback/google`

## Files

- `src/app/login/page.js`
- `src/app/api/auth/google/route.js`
- `src/app/api/auth/callback/google/route.js`
- `src/lib/google.js`
- `src/models/User.js`

## Limits

- The Google scope is `openid email profile`.
- Google shows the account picker (`prompt=select_account`).
- The application does not store the Google access token.
