# Queue

Show a token. Scan the QR. We tell you when it is ready.

Queue is a wait app for restaurants and barbers. An owner creates an order, shows a QR code, and marks food (or a chair) **ready**. A guest scans the QR, sees their **token**, and can get a push when it is **ready**. Guests do not log in.

- **Live:** [queue-crash.vercel.app](https://queue-crash.vercel.app/)
- **Demo:** [https://lnkd.in/p/gJxbnupE](https://lnkd.in/p/gJxbnupE)
- **GitHub:** [iutkarsh077/queue-crash](https://github.com/iutkarsh077/queue-crash)
- **How it works (in the app):** [queue-crash.vercel.app/how](https://queue-crash.vercel.app/how)

## Why this exists

Waiting for food or a chair is noisy and unclear. Guests wait about 10–40 minutes and do not know **where they are**, **how long**, or **what to do next**. They stand at the counter and keep asking if it is ready.

Owners get interrupted by that traffic. They need a fast counter move: make a **token**, show a **QR**, tap **Ready** when the food (or chair) is actually ready.

Queue exists so a guest can sit, walk, or look at a phone instead of hovering the counter — and so the front desk hears “is it ready yet?” less often.

## Who it is for

| Person | Job | Success |
| --- | --- | --- |
| **Owner** | Create orders, show the QR, mark **Ready** | Token and QR in seconds; one tap when food is ready |
| **Guest** | Wait without hovering the counter | Token, status, optional push when **Ready** |

## How it works

**Owner**

1. Log in with Google.
2. Create an order (optional label, such as Table 4).
3. Show or download the QR code.
4. Mark the order **Ready**, then **Picked up**.

**Guest**

1. Scan the QR code (or open the order link).
2. See the token and status: **Waiting** or **Ready**.
3. Optionally tap **Notify me** for a food-ready push.
4. Install **Queue** from Chrome if they want the wait page on the home screen.

The home page at `/` returns a guest to the last order they opened, or tells them to scan the QR.

## What the app does

- Google log in for owners only
- Daily token and QR for each order
- Owner dashboard: create order, Today list, **Ready** / **Picked up**
- Public order page: large token, **Waiting** / **Ready**, no guest account
- Web push when the owner marks **Ready** (the open order page still updates if push does not arrive)
- Calm green, white, and black wait UI on phone first

## What this is not

Queue is not table reservations, an online menu, payments, or a guest account product. It does not collect a guest name, email, or phone number.

## Stack

Next.js App Router, React, Tailwind, MongoDB, Google login, Web Push, and a small service worker for alerts.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
```

You need your own Google login and database credentials to run owner flows locally. Do not commit secrets.

## License

Private project unless the repository owner states otherwise.
