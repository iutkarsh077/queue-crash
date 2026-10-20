---
name: wait-queue-frontend
description: >-
  Designs and implements the frontend for a wait-queue app (restaurant food
  ready, barber/salon turn). Uses a green, white, and black theme, large wait
  status, and calm mobile-first UI. Use when building pages, layouts, components,
  styles, Tailwind classes, or copy for this app; when the user mentions queue,
  wait, position, restaurant, barber, dashboard, or login UI.
---

# Wait-queue frontend

Build UI for people who wait 10–40 minutes for food or a barber chair. The screen must answer three questions at a glance: **Where am I?** **How long?** **What do I do next?**

Stack: Next.js App Router, Tailwind, existing Geist fonts. Do not add extra UI libraries unless asked.

## Color (only green, white, black)

Do not introduce blue, purple, orange, or gray palettes. Use black tints of green/black for muted UI.

| Token | Hex | Use |
| --- | --- | --- |
| `white` | `#FFFFFF` | Page background (light) |
| `paper` | `#F4F7F4` | Cards, input fill |
| `ink` | `#0A0A0A` | Text, icons, borders |
| `ink-soft` | `#1A1A1A` | Secondary text (still near-black) |
| `green` | `#1F8A4C` | Primary actions, “your turn”, progress |
| `green-deep` | `#146338` | Pressed/hover primary |
| `green-wash` | `#E7F5EC` | Success chips, selected rows |

Dark surfaces (nav bars, primary buttons, late-night venues): background `#0A0A0A`, text `#FFFFFF`, accents `#1F8A4C`. Do not use a full gray dark theme.

Contrast: body text is ink on white or white on ink. Green is for buttons and status, not long paragraphs.

Map tokens in `src/app/globals.css` (`@theme`) and reuse them. Do not hardcode random greens.

## Layout

- Mobile-first. Design 390px first, then 768 / 1024.
- One column. Max content width `28rem` on phone, `42rem` on tablet.
- Plenty of space. Default padding `24px`. Card radius `20px`.
- Bottom-safe actions: primary CTA stays visible above the thumb (`sticky bottom` with padding for home indicator).
- No dense dashboards for guests. Staff/admin can use lists; guests see **one** live wait card.

## Type

- Headings: Geist Sans, semibold, tight tracking.
- Position number: the largest element on the wait screen (`text-7xl`–`text-8xl`), tabular nums, ink on paper or green-wash.
- Body: 16–18px, line-height 1.5. Do not use tiny captions for wait time.
- Copy in short sentences. Same words every time: **log in**, **queue**, **position**, **wait time**, **you are next**, **ready**. Do not mix “sign in” / “line” / “ETA”.

## Guest screens (priority)

Build in this order unless the user names a different screen.

1. **Log in** — white page, one green **Log in with Google** button, black text. No extra social buttons.
2. **Join queue** — venue name, service (food / barber), party size. One green **Join queue**.
3. **Waiting** — venue name, huge **position**, wait time in minutes (`About 30 minutes`), a simple green progress bar (people ahead vs total). Quiet helper: “We will tell you when it is your turn.”
4. **You are next** — green-wash card, black text, pulse only on the status chip. CTA: **I am here** (if needed).
5. **Ready** — full green header or banner, white/black text: **Your food is ready** or **Your turn**. CTA: **On my way** / **Done**.
6. **Empty / error** — black text, one green retry. Never a joke empty state.

Staff screens (later): live queue list, call next, mark ready. Same tokens. Rows: name, position, wait time. Green **Call next**.

## Components

- **Primary button**: `bg-green text-white`, height 48px, full width on mobile, radius full or 14px. Hover `green-deep`.
- **Secondary button**: white fill, 1px ink border, ink text.
- **Danger** (leave queue): ink outline, not red. Confirm in a simple dialog.
- **Wait card**: paper background, ink border `1px`, large position, wait time under it, progress in green.
- **Status chip**: green-wash + green text for active; ink on paper for waiting.
- **Progress**: track `paper` or white; fill `green`. No striped animation that looks like a download bar.
- **Inputs**: paper fill, ink border, 48px height, visible focus ring `green`.
- **Nav**: white top bar, ink title, no colorful logos. Optional small green mark (dot or leaf), not a rainbow icon.

Do not use drop shadows heavier than `0 8px 24px` at 8% black. Prefer border + space.

## Motion

- Slow and small. 200–300ms ease-out.
- Position changes: number crossfade, not spinning counters.
- Ready state may use a single short pulse on the chip. No confetti, no full-screen flash.

## Accessibility

- Position and wait time must stay readable in sunlight (high contrast, large type).
- Focus visible on all controls.
- Status changes announced (live region) when position drops or status becomes **ready**.
- Do not rely on green alone: pair color with words (“Ready”, “Position 4”).
- Hit targets ≥ 44px.

## Do / do not

**Do**
- Show position and minutes above the fold.
- Keep Google login visually quiet (green button, no extra Google-colored blobs).
- Use real minutes (`About 30 minutes`), not vague “soon”, unless status is **ready**.

**Do not**
- Add a second accent color.
- Put the wait number in a tiny badge.
- Auto-play sound unless the user enables alerts.
- Clone generic SaaS sidebars for the guest wait flow.

## Implementation notes

- Reuse `src/app/globals.css` tokens; extend `@theme` rather than one-off hex in every file.
- Match current auth routes (`/login`, `/dashboard`, `/api/auth/google`). Guest wait UI can live under `/dashboard` or a later `/queue` route; do not restyle by adding new color systems.
- After UI changes, verify in the browser: login, wait card, ready state, mobile width (~390px).
