# Deployment Documentation

## Production Deployment Checklist

1. **Environment Variables**: Make sure all critical env vars are set in your platform environment (Render, AWS, Heroku).
2. **MongoDB Connection Pool**: Ensure `maxPoolSize` and connection options are tuned for high load.
3. **Redis Setup**: Configure a persistent Redis instance for BullMQ and rate-limiting.
4. **Stripe webhook setup**: Set up and point Stripe webhooks to `https://<your-domain>/api/payments/webhook` with signature checking.

## Build and Start Commands

```bash
# Build
npm run build

# Start
npm start
```
