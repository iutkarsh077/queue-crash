# Features

This folder describes each product feature. Use the same words in all files.

| Word | Meaning |
| --- | --- |
| owner | Person who logs in and creates orders |
| guest | Person who opens an order page from a QR code |
| order | One food token for one guest |
| token | Daily number that the guest sees |
| session | Signed cookie that identifies the owner |
| queue | Wait list for food or a barber |

Read the data flow in [spec.md](spec.md).

## Feature list

1. [Google login](google-login.md)
2. [Session](session.md)
3. [Route protection](route-protection.md)
4. [Create order](create-order.md)
5. [Owner dashboard](owner-dashboard.md)
6. [Public order status](public-order-status.md)
7. [Wait-queue UI](wait-queue-ui.md)
8. [Food-ready web push](web-push.md)

The home page at `/` opens the last scanned order, or tells the guest to scan the QR code.
