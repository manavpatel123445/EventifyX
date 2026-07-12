# Environment Variables Configuration

| Variable Name | Description | Required | Example |
|---|---|---|---|
| `JWT_SECRET` | Secret key for signing Access Tokens | Yes | `yoursupersecretaccesskey` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | Yes | `yoursupersecretrefreshkey` |
| `MONGODB_URL` | MongoDB Connection URI | Yes | `mongodb+srv://...` |
| `REDIS_URL` | Redis instance connection URL | Yes (BullMQ) | `redis://127.0.0.1:6379` |
| `STRIPE_SECRET_KEY` | Stripe developer API private key | Yes | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe signature signing secret | Yes | `whsec_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Identifier | Yes | `cloudName` |
