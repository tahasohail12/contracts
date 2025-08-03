# 🚀 Quick Start Commands

## Method 1: Automated Setup (Recommended)

### For Windows:
```cmd
# Double-click or run:
quick-setup.bat
```

### For Linux/Mac:
```bash
chmod +x quick-setup.sh
./quick-setup.sh
```

## Method 2: Manual Setup

### 1. Initial Setup
```bash
# Clone repository (if not already done)
git clone https://github.com/tahasohail12/contracts.git
cd contracts

# Install all dependencies
npm run setup

# Compile smart contracts
npm run compile
```

### 2. Configure Environment
```bash
# Edit backend environment file
# Copy backend/.env.example to backend/.env
# Add your MongoDB Atlas and Infura credentials
```

### 3. Start the Platform

#### Option A: Start Both Services Together
```bash
npm run start:dev
```

#### Option B: Start Services Separately

**Terminal 1 - Backend:**
```bash
npm run start:backend
# Backend runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
# Frontend runs on http://localhost:3001
```

### 4. Verify Installation
```bash
# Run integration tests
npm run test:integration

# Test content functionality
npm run test:content
```

## 📱 Access the Platform

1. **Frontend Application**: http://localhost:3001
2. **Backend API**: http://localhost:3000
3. **Health Check**: http://localhost:3000/health

## 🔧 Additional Commands

```bash
# Run smart contract tests
npm test

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Clean and reinstall everything
npm run reset

# Run all verification tests
npm run verify
```

## ⚡ Minimum Requirements

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **MongoDB Atlas**: Free tier account
- **Infura**: Free account for Ethereum access
- **MetaMask**: Browser extension
- **Sepolia ETH**: From faucet for testing

## 🆘 Quick Troubleshooting

### If backend fails to start:
1. Check MongoDB connection string in `backend/.env`
2. Verify Infura project ID
3. Ensure wallet private key is correct

### If frontend fails to start:
1. Delete `frontend/node_modules` and run `npm install`
2. Check Node.js version: `node --version`
3. Clear browser cache

### If tests fail:
1. Ensure backend is running
2. Check network connectivity
3. Verify smart contract addresses

## 🎯 Success Checklist

- [ ] Both backend and frontend start without errors
- [ ] Integration tests show 100% pass rate
- [ ] You can access frontend at localhost:3001
- [ ] MetaMask connects successfully
- [ ] You can upload and verify files
- [ ] Content appears in gallery

---

**✅ When all items are checked, your platform is ready to use!**
