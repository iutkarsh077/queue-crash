# Wait-queue UI

The product UI uses a green, white, and black theme. The screen must answer three questions:

1. Where am I?
2. How long?
3. What do I do next?

Use short sentences. Use the same words: **log in**, **queue**, **position**, **wait time**, **you are next**, **ready**.

## Colors

| Token | Hex | Use |
| --- | --- | --- |
| white | `#FFFFFF` | Page background |
| paper | `#F4F7F4` | Cards, input fill |
| ink | `#0A0A0A` | Text, borders |
| ink-soft | `#1A1A1A` | Secondary text |
| green | `#1F8A4C` | Primary actions, ready state |
| green-deep | `#146338` | Hover on primary |
| green-wash | `#E7F5EC` | Ready card |

Do not add blue, purple, orange, or gray palettes.

## Layout rules

- Design for 390 px first.
- One column.
- Primary action stays at the bottom on mobile.
- Guest screens show one wait card. Do not show a dense table to the guest.

## Screens in this version

| Screen | Path | Role |
| --- | --- | --- |
| Log in | `/login` | Owner |
| Dashboard | `/dashboard` | Owner |
| Order status | `/o/[orderId]` | Guest |
| Order not found | `/o/[orderId]` | Guest |

## Shared components

`GuestShell` is the page frame: top bar, content, sticky footer.

- Primary button: green fill, white text
- Secondary button: white fill, ink border

The token number uses large type (`text-7xl` to `text-8xl`).

## Files

- `src/app/globals.css`
- `src/components/guest-shell.js`
- `.cursor/skills/wait-queue-frontend/SKILL.md`
