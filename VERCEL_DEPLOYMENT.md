# 🚀 Vercel Deployment Guide for NFT Content Authentication Platform

## Quick Deploy to Vercel

### **Method 1: Direct GitHub Integration (Recommended)**

1. **Go to [vercel.com](https://vercel.com) and sign in with GitHub**

2. **Import your repository:**
   - Click "New Project"
   - Select your `contracts` repository
   - **Important**: Set the root directory to `frontend/`

3. **Configure build settings:**
   ```
   Framework Preset: Create React App
   Root Directory: frontend/
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install --legacy-peer-deps
   ```

4. **Set environment variables:**
   ```
   REACT_APP_API_URL = https://your-backend-url.railway.app
   REACT_APP_NETWORK = sepolia
   ```

5. **Deploy!** 
   - Click "Deploy" and wait for build completion
   - Your app will be live at `https://your-app-name.vercel.app`

### **Method 2: Vercel CLI (Advanced)**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# For production deployment
vercel --prod
```

## 🔄 Ensuring Latest Deployment

### **Auto-Deploy from GitHub (Recommended)**
Once connected, Vercel automatically deploys when you push to main branch:

```bash
# Make changes and commit
git add .
git commit -m "Update platform features"
git push origin main

# Vercel will automatically detect and deploy
```

### **Manual Force Redeploy**
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment

### **Check Deployment Status**
```bash
# Check latest commit hash
git log --oneline -1

# Compare with deployed version in Vercel dashboard
```

## 📋 Pre-Deployment Checklist

### **✅ Before Each Deployment:**

1. **Test locally:**
   ```bash
   cd frontend
   npm start
   # Verify everything works at http://localhost:3001
   ```

2. **Build successfully:**
   ```bash
   npm run build
   # Check for any build errors
   ```

3. **Update environment variables:**
   - Backend API URL
   - Smart contract addresses
   - Network configuration

4. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Deploy: [describe changes]"
   git push origin main
   ```

## 🔧 Vercel-Specific Configuration

### **Environment Variables in Vercel:**
```
REACT_APP_API_URL = https://nft-backend.railway.app
REACT_APP_NETWORK = sepolia
REACT_APP_MEDIA_REGISTRY = 0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1
REACT_APP_NFT_MINTING = 0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E
REACT_APP_LICENSE_MANAGER = 0x2A9296ea885e84AcCD1b3af984C433424Da02FdB
```

### **Build Optimization:**
The `vercel.json` file is configured for:
- ✅ React build optimization
- ✅ Proper routing for SPA
- ✅ Fast deployment
- ✅ Automatic dependency installation

## 🚨 Troubleshooting Vercel Deployment

### **Common Issues & Solutions:**

1. **Build Fails:**
   ```bash
   # Local test
   cd frontend
   npm run build
   
   # Fix TypeScript errors
   # Check console for specific errors
   ```

2. **App Loads but API Calls Fail:**
   - ✅ Check `REACT_APP_API_URL` in Vercel env vars
   - ✅ Ensure backend is deployed and accessible
   - ✅ Check CORS settings in backend

3. **MetaMask Connection Issues:**
   - ✅ Verify smart contract addresses
   - ✅ Ensure Sepolia network configuration
   - ✅ Check Web3Provider setup

4. **Missing Dependencies:**
   ```bash
   # In Vercel dashboard, check build logs
   # Add --legacy-peer-deps to install command
   ```

## 📊 Monitoring Your Deployment

### **Vercel Dashboard:**
- **Analytics**: Monitor page views and performance
- **Functions**: Check API endpoint usage (if using Vercel functions)
- **Deployments**: View deployment history and logs
- **Settings**: Manage environment variables and domains

### **Health Checks:**
```javascript
// Test key functionality after deployment:
// 1. Wallet connection
// 2. Content upload
// 3. Hash verification
// 4. IPFS integration
// 5. Smart contract interaction
```

## 🎯 Production Optimization

### **Performance Tips:**
1. **Image Optimization**: Use Vercel's built-in image optimization
2. **Caching**: Configure appropriate cache headers
3. **Bundle Analysis**: Use `npm run build` to check bundle size
4. **Environment Splitting**: Separate dev/staging/prod environments

### **Security Considerations:**
- ✅ Environment variables are secure in Vercel
- ✅ API keys are not exposed to frontend
- ✅ HTTPS is automatic
- ✅ DDoS protection included

## 🔗 Integration with Backend

### **Backend Deployment (Railway/Heroku):**
1. Deploy backend first
2. Note the backend URL
3. Update `REACT_APP_API_URL` in Vercel
4. Redeploy frontend

### **Database Connection:**
- MongoDB Atlas connection string in backend env vars
- Frontend only needs API endpoints, not direct DB access

---

## 📞 Quick Commands Reference

```bash
# Check current deployment
git log --oneline -1

# Force redeploy (push empty commit)
git commit --allow-empty -m "Force redeploy"
git push origin main

# Local build test
cd frontend && npm run build

# Check Vercel status
vercel --help
```

Your NFT Content Authentication Platform is now ready for seamless Vercel deployment with automatic updates from GitHub! 🚀
