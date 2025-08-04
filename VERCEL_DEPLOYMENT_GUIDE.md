# 🚀 NFT Content Authentication Platform - Vercel Deployment Guide

## **Overview**
Deploy your full-stack NFT platform to Vercel with automatic CI/CD, serverless backend, and global CDN.

---

## **Prerequisites**
- ✅ GitHub account with repository access
- ✅ Vercel account (free tier available)
- ✅ MongoDB Atlas account (for production database)
- ✅ Node.js 18+ installed locally

---

## **Step 1: Prepare Repository**

### 1.1 Commit Current Changes
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 1.2 Verify Repository Structure
```
contracts/
├── frontend/               # React frontend
├── backend/               # Node.js API
├── contracts/             # Smart contracts
├── package.json           # Root package.json with build scripts
├── vercel.json           # Vercel configuration
├── .env.vercel           # Environment variables template
└── README.md
```

---

## **Step 2: Setup MongoDB Atlas (Production Database)**

### 2.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create new project: "NFT-Content-Auth"
3. Build free cluster (M0 Sandbox)
4. Choose cloud provider and region
5. Create cluster (takes 1-3 minutes)

### 2.2 Configure Database Access
```bash
# Database User
Username: nft-admin
Password: [Generate secure password]
Role: Atlas Admin

# Network Access
IP Address: 0.0.0.0/0 (Allow access from anywhere)
```

### 2.3 Get Connection String
```
✅ Your Connection String:
mongodb+srv://tahasohail28:FqxKWf9EDPj9L9zv@cluster0.wg8afro.mongodb.net/nft-content-auth
```

---

## **Step 3: Deploy to Vercel**

### 3.1 Sign Up & Connect GitHub
1. Visit [vercel.com](https://vercel.com/)
2. Sign up with GitHub account
3. Import repository: `tahasohail12/contracts`
4. Configure project settings:
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run vercel-build
   Output Directory: frontend/build
   Install Command: npm install
   ```

### 3.2 Configure Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these variables:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://tahasohail28:FqxKWf9EDPj9L9zv@cluster0.wg8afro.mongodb.net/nft-content-auth
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/f30bff13a25c46cb8ab16fc33df75aa4
SEPOLIA_PRIVATE_KEY=f794863ff16cba3b7d8bc489c5e599547ddd016602ce4db535d961b6ea4282cb
MEDIA_REGISTRY_ADDRESS=0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1
NFT_MINTING_ADDRESS=0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E
LICENSE_MANAGER_ADDRESS=0x2A9296ea885e84AcCD1b3af984C433424Da02FdB
WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D6aE3e8B8C0323FC
```

### 3.3 Deploy Application
```bash
# Automatic deployment triggers on:
- Push to main branch
- Manual redeploy from Vercel dashboard

# Deployment process:
1. Install dependencies
2. Build frontend (React)
3. Setup backend (Serverless functions)
4. Deploy to global CDN
5. Assign production URL
```

---

## **Step 4: Verify Deployment**

### 4.1 Check Application URLs
```bash
# Production URLs (replace 'your-app' with actual subdomain)
Frontend: https://your-app.vercel.app
API Health: https://your-app.vercel.app/api/health
File Upload: https://your-app.vercel.app/api/upload
```

### 4.2 Test Core Functionality
```bash
# 1. Health Check
curl https://your-app.vercel.app/api/health

# 2. File Upload Test
curl -X POST https://your-app.vercel.app/api/upload \
  -F "file=@test-image.jpg" \
  -F "title=Test Upload"

# 3. Frontend Access
# Visit: https://your-app.vercel.app
# Test: MetaMask connection, file upload, blockchain interaction
```

### 4.3 Monitor Deployment
```bash
# Vercel Dashboard provides:
- Real-time logs
- Performance metrics
- Error tracking
- Analytics
- Function execution stats
```

---

## **Step 5: Post-Deployment Configuration**

### 5.1 Update Frontend API URLs
Update your frontend code to use production API:
```javascript
// In your React components
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Vercel serverless functions
  : 'http://localhost:8080/api';
```

### 5.2 Configure Custom Domain (Optional)
```bash
# Vercel Dashboard → Domains
1. Add custom domain
2. Configure DNS records
3. Enable automatic HTTPS
4. Update CORS settings
```

### 5.3 Setup Monitoring
```bash
# Enable Vercel Analytics
1. Go to Analytics tab
2. Enable Web Analytics
3. Add to React app:
   npm install @vercel/analytics
   # Add to index.js: import { Analytics } from '@vercel/analytics/react'
```

---

## **Architecture on Vercel**

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│ │   React Frontend │  │ Serverless APIs │  │  Static CDN  │ │
│ │   (Static Build) │  │ (Node.js Functions)│  │ (Global)   │ │
│ └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
          │                     │                     │
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐
│  MongoDB Atlas  │  │ Sepolia Testnet │  │     IPFS     │
│  (Database)     │  │  (Blockchain)   │  │  (Storage)   │
└─────────────────┘  └─────────────────┘  └──────────────┘
```

---

## **Cost Breakdown**

### Vercel (Free Tier)
```
✅ 100GB Bandwidth/month
✅ 100 Serverless Function executions/day
✅ 6,000 Build minutes/month
✅ Automatic HTTPS & CDN
✅ Unlimited static sites
```

### MongoDB Atlas (Free Tier)
```
✅ 512MB Storage
✅ Shared RAM & CPU
✅ No backup (upgrade for backups)
✅ Perfect for development/testing
```

### **Total Monthly Cost: $0** 🎉

---

## **Troubleshooting**

### Common Issues & Solutions

#### 1. Build Failures
```bash
# Error: Module not found
Solution: Check package.json dependencies
Command: npm install --save missing-package

# Error: Environment variables not set
Solution: Configure in Vercel dashboard
Location: Settings → Environment Variables
```

#### 2. API Connection Issues
```bash
# Error: CORS policy
Solution: Update backend CORS configuration
File: backend/server.js
Add: app.use(cors({ origin: 'https://your-app.vercel.app' }))

# Error: MongoDB connection
Solution: Check Atlas connection string
Verify: Network access (0.0.0.0/0)
```

#### 3. Serverless Function Timeouts
```bash
# Error: Function timeout (10s limit)
Solution: Optimize database queries
Consider: Implementing caching
Upgrade: To Pro plan for 60s timeout
```

---

## **Next Steps**

### 1. Production Optimization
- [ ] Implement Redis caching
- [ ] Add error monitoring (Sentry)
- [ ] Setup automated testing
- [ ] Configure backup strategies

### 2. Scale Preparation
- [ ] Monitor usage metrics
- [ ] Plan database indexing
- [ ] Implement rate limiting
- [ ] Consider CDN optimization

### 3. Security Enhancements
- [ ] Implement API rate limiting
- [ ] Add request validation
- [ ] Setup security headers
- [ ] Regular dependency updates

---

## **Support Resources**

- 📚 [Vercel Documentation](https://vercel.com/docs)
- 🛠️ [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- 🎯 [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- 💬 [Community Support](https://vercel.com/discord)

---

**🎉 Your NFT Content Authentication Platform is now live on Vercel!**

Access your application at: `https://your-project-name.vercel.app`
