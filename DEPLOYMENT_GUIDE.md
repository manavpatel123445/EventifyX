# 🚀 EventifyX Deployment Guide

## Overview
EventifyX is a full-stack event management application with:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Payment**: Stripe

## 📋 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended
### Option 2: Netlify (Frontend) + Railway (Backend)
### Option 3: DigitalOcean App Platform (Full Stack)

## 🛠️ Option 1: Vercel + Railway Deployment (Recommended)

### Frontend Deployment (Vercel)

1. **Deploy to Vercel:**
   - Go to [Vercel](https://vercel.com/)
   - Click "Import Project"
   - Connect your GitHub repository
   - Vercel will auto-detect it's a Vite project and configure automatically

2. **Configure Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-railway-backend-url.railway.app
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
     ```

3. **Configure Build Settings (if needed):**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework: `Vite`

### Backend Deployment (Railway)

1. **Prepare Backend for Railway:**
   - Go to [Railway](https://railway.app/)
   - Create a new project

2. **Deploy Backend:**
   - Connect your GitHub repository
   - Railway will auto-detect it's a Node.js app
   - Configure environment variables in Railway dashboard:
     ```
     PORT=3000
     NODE_ENV=production
     CLIENT_URL=https://your-vercel-app.vercel.app
     MONGODB_URI=mongodb://your-mongodb-uri
     JWT_SECRET=your-strong-jwt-secret
     STRIPE_SECRET_KEY=sk_live_your_stripe_secret
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
     CLOUDINARY_CLOUD_NAME=your-cloudinary-name
     CLOUDINARY_API_KEY=your-cloudinary-api-key
     CLOUDINARY_API_SECRET=your-cloudinary-api-secret
     ```

3. **Set up MongoDB:**
   - Use Railway's built-in MongoDB or connect to MongoDB Atlas
   - Get the connection string and add it as `MONGODB_URI`

## 🛠️ Option 2: Netlify + Railway Deployment (Alternative)

### Frontend Deployment (Netlify)

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `dist` folder from your frontend build
   - Or connect your GitHub repository for automatic deployments

3. **Configure Environment Variables in Netlify:**
   - Go to Site Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-railway-backend-url.railway.app
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
     ```

## 🔧 Required Services & Setup

### 1. MongoDB Database
**Option A: Railway MongoDB**
- Railway provides MongoDB out of the box
- Use the internal Railway MongoDB URL

**Option B: MongoDB Atlas**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster (free tier available)
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/eventifyx`

### 2. Stripe Payment Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your publishable key (pk_live_...) and secret key (sk_live_...)
3. Set up webhook endpoint: `https://your-backend-url.com/api/payments/webhook`
4. Get webhook secret from Stripe dashboard

### 3. Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create account and get:
   - Cloud name
   - API Key
   - API Secret

## 📝 Environment Variables Checklist

### Frontend (.env.production or Vercel/Netlify Environment Variables):
```
✅ VITE_API_URL=https://your-backend-domain.com
✅ VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

### Backend (.env in Railway):
```
✅ PORT=3000
✅ NODE_ENV=production
✅ CLIENT_URL=https://your-frontend-domain.com
✅ MONGODB_URI=mongodb://your-mongodb-connection-string
✅ JWT_SECRET=your-very-strong-secret-here
✅ STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
✅ STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
✅ CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
✅ CLOUDINARY_API_KEY=your-cloudinary-api-key
✅ CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 🚀 Quick Deployment Commands

### Frontend (Vercel):
```bash
# Vercel handles everything automatically via GitHub integration
# Just push to your repository and Vercel will deploy
```

### Backend (Railway):
```bash
# Railway handles everything automatically via GitHub integration
# Just push to your repository and configure environment variables in Railway dashboard
```

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Update `CLIENT_URL` in backend to match your frontend domain
2. **Database Connection**: Check MongoDB connection string format
3. **File Uploads**: Verify Cloudinary credentials
4. **Payments**: Ensure Stripe keys are correct and webhook is configured

### Check Logs:
- **Vercel**: Project Settings → Functions → Logs
- **Railway**: Project → Deployments → View Logs

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set correctly
3. Ensure all services (MongoDB, Stripe, Cloudinary) are properly configured
4. Test API endpoints before frontend deployment

## 🎉 Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Backend API responds correctly
- [ ] Database connection works
- [ ] File uploads to Cloudinary work
- [ ] Stripe payments process correctly
- [ ] User authentication works
- [ ] Event creation and management works
- [ ] Email notifications work (if configured)

---

**Happy Deploying! 🎊**
