# MongoDB Atlas Setup Guide

## 🚀 Quick Setup with MongoDB Atlas (Free)

### Step 1: Create Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" 
3. Sign up with email/Google/GitHub

### Step 2: Create Cluster
1. Choose "Shared" (Free tier)
2. Select region closest to you
3. Keep default settings
4. Click "Create Cluster"

### Step 3: Database Access
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Choose username/password authentication
4. Create a user (save credentials!)
5. Grant "Read and write to any database"

### Step 4: Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
4. Or add your current IP only

### Step 5: Get Connection String
1. Go to "Clusters"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace <password> with your database user password

### Step 6: Update .env
Replace this line in your .env file:
```
MONGODB_URI=mongodb://localhost:27017/nft-content-auth
```

With your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nft-content-auth
```

### Example Connection String:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/nft-content-auth?retryWrites=true&w=majority
```
