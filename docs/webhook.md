# Webhook Documentation

Stripe webhooks are captured securely at `/api/payments/webhook`.

## Webhook Signature Verification

We verify webhook payloads using Stripe's dynamic SDK signature construct method.

```javascript
import verifyStripeWebhook from "./middlewares/webhookVerification.js";

router.post("/webhook", express.raw({ type: "application/json" }), verifyStripeWebhook, paymentController.stripeWebhook);
```

## Handled Events

- `checkout.session.completed`: Dispatches ticket generation, database logs creation, and ticket inventory modifications.
