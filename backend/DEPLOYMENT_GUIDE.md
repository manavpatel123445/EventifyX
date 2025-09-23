# EventifyX Backend Deployment Guide for Render.com

## 🚀 Deploying to Render.com

This guide will help you deploy your EventifyX backend to Render.com.

### Step 1: Create a New Web Service on Render.com

1. Go to [Render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository containing the `backend` folder
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
MONGODB_URL=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key-here
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CLIENT_URL=https://your-frontend-domain.onrender.com
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
2. Wait for the deployment to complete (check logs if it fails)
3. Your backend will be available at the provided URL

### Step 5: Verify Deployment

Check these endpoints after deployment:

- **Root**: `https://your-backend.onrender.com/` → Should return "EventifyX API is running..."
- **Health**: `https://your-backend.onrender.com/health` → Should return health status

## 🛠️ Troubleshooting Common Issues

### Issue 1: "Could not read package.json" Error
**Error**: `npm error enoent Could not read package.json: Error: ENOENT: no such file or directory`

**Solution**:
1. Ensure your repository structure has the `package.json` in the root of the backend folder
2. Check that the `render.yaml` file is in the root of your repository
3. Make sure the build command is `npm install` (not `npm install && npm run build`)

### Issue 2: Build Command Issues
**Error**: Build fails during `npm run build`

**Solution**:
- Our backend doesn't need a build step since it's pure JavaScript
- The `build` script in package.json just echoes a success message
- If you see build errors, check that all dependencies are listed in package.json

### Issue 3: Environment Variables Not Loading
**Error**: Server starts but crashes due to missing environment variables

**Solution**:
1. Ensure all required environment variables are set in Render.com dashboard
2. Mark sensitive variables as "Secret" in Render.com
3. Check the service logs for specific missing variables
4. Run `npm run validate-env` locally to test your configuration

### Issue 4: Database Connection Issues
**Error**: MongoDB connection fails

**Solution**:
1. Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
2. Double-check your connection string format
3. Verify your database username and password are correct

### Issue 5: Port Configuration
**Error**: Server won't start on the correct port

**Solution**:
- Render.com automatically sets the `PORT` environment variable
- Our server automatically uses `process.env.PORT || 3000`
- No manual port configuration needed

## 📋 Using the render.yaml Configuration

If you're using the `render.yaml` file in your repository root:

```yaml
services:
  - type: web
    name: eventifyx-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: CLIENT_URL
        sync: false
```

## 🔍 Debugging Deployment Issues

1. **Check Service Logs**: Go to your Render.com service dashboard → Logs
2. **Test Environment Variables**: Use the `/health` endpoint to verify configuration
3. **Validate Configuration**: Run `npm run validate-env` locally before deploying
4. **Check Build Output**: Look for npm install errors or missing dependencies

## 📝 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created and configured
- [ ] Stripe account set up with API keys
- [ ] Cloudinary account configured
- [ ] All environment variables generated and set
- [ ] Repository structure is correct
- [ ] render.yaml file is in repository root
- [ ] All sensitive data is in .gitignore

## 🚀 Post-Deployment Verification

After successful deployment:

1. Test the root endpoint: `GET /`
2. Test the health endpoint: `GET /health`
3. Verify all API routes are working
4. Test database connectivity
5. Check that environment variables are loaded correctly

Your EventifyX backend should now be successfully deployed on Render.com! 🎉

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
