# EventifyX Backend Deployment Guide for Render.com

## 🚀 Deploying to Render.com

This guide will help you deploy your EventifyX backend to Render.com.

### Step 1: Create a New Web Service on Render.com

1. Go to [Render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in the service details:
   - **Name**: `eventifyx-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Configure Environment Variables

Add the following environment variables in your Render.com service dashboard:

#### Required Variables:
```
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.onrender.com

# Database (MongoDB Atlas)
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/eventifyx

# Authentication (generate strong secrets)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Step 3: Generate Secure Secrets

Before deploying, generate secure values for:

1. **JWT_SECRET**: Use a strong random string (at least 64 characters)
   ```bash
   openssl rand -base64 64
   ```

2. **Database Connection**: Set up MongoDB Atlas and get your connection string

3. **Stripe Keys**: Get these from your Stripe dashboard

4. **Cloudinary Credentials**: Get these from your Cloudinary dashboard

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the deployment to complete
3. Your backend will be available at the provided URL

### Step 5: Verify Deployment

Check these endpoints after deployment:

- **Root**: `https://your-backend.onrender.com/` → Should return "EventifyX API is running..."
- **Health**: `https://your-backend.onrender.com/health` → Should return health status

### Troubleshooting

#### Common Issues:

1. **Port Issues**: The app automatically uses `$PORT` environment variable set by Render.com

2. **Database Connection**: Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)

3. **Environment Variables**: Ensure all required variables are set in Render.com dashboard

4. **Build Errors**: Check the build logs in Render.com dashboard

#### Health Check:
The `/health` endpoint provides system status and can help debug issues.

### Security Notes

- Never commit your `.env` file to Git
- Use strong, randomly generated secrets
- Regularly rotate your API keys
- Monitor your service logs in Render.com dashboard

### Support

If you encounter issues:
1. Check the Render.com service logs
2. Verify all environment variables are set correctly
3. Ensure your database is accessible
4. Check that all required services (MongoDB Atlas, Stripe, Cloudinary) are properly configured
