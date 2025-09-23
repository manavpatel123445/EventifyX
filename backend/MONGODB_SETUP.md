# 🚀 MongoDB Atlas Quick Setup Guide

## **5-Minute MongoDB Atlas Setup:**

### **Step 1: Create Account**
1. Go to https://cloud.mongodb.com
2. Click "Try Free" or "Sign Up"
3. Use Google/GitHub or create account

### **Step 2: Create Cluster**
1. Click "Build a Database"
2. Choose **"M0 Sandbox"** (FREE)
3. Provider: **AWS**
4. Region: Choose closest to you
5. Cluster name: **EventifyX**
6. Click "Create Cluster"

### **Step 3: Create User**
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: **eventifyx_user**
4. Password: **create_secure_password**
5. Built-in Role: **Read and write to any database**
6. Click "Add User"

### **Step 4: Network Access**
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere"
4. Click "Confirm"

### **Step 5: Get Connection String**
1. Go to "Clusters"
2. Click "Connect"
3. Click "Connect your application"
4. Copy the connection string

### **Step 6: Update Render.com**
1. Go to your Render.com service
2. Go to "Environment"
3. Set MONGODB_URL to your connection string
4. Redeploy

## 🎯 **Your Connection String Format:**
```
mongodb+srv://eventifyx_user:your_password@cluster0.xxxxx.mongodb.net/EventifyX?retryWrites=true&w=majority
```

Replace:
- `eventifyx_user` with your username
- `your_password` with your password
- `cluster0.xxxxx` with your actual cluster URL
- `EventifyX` with your database name

## ✅ **Done! Your backend will connect to MongoDB Atlas successfully!**
