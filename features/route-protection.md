# Route protection

The application protects `/dashboard` and `/login` before the page renders. The check is in `src/proxy.js`.

## Rules

1. If the path starts with `/dashboard` and there is no `session` cookie, send the person to `/login`.
2. If the path is `/login` and there is a `session` cookie, send the person to `/dashboard`.
3. For all other paths, continue.

The proxy does not check the cookie signature. The page and the API check the signature.

## Paths that the proxy does not block

- `/` (home)
- `/o/[orderId]` (guest order page)
- `/api/auth/google`
- `/api/auth/callback/google`
- `/api/auth/logout`
- `/api/orders` (the route handler checks login)

## Why the pages wait

`/login` and `/dashboard` set `instant` to `false`. The page waits for navigation. This stops a prefetch error when the application redirects.

## Files

- `src/proxy.js`
- `src/app/login/page.js`
- `src/app/dashboard/page.js`
