# NFT Content Authentication Platform - Frontend Startup Guide

## 🚨 Frontend Not Working? Follow These Steps:

### Step 1: Manual Frontend Startup
Open a new terminal/command prompt and run these commands:

```bash
# Navigate to frontend directory
cd "c:\Users\tsohail\Downloads\NFT final project latest\contracts\frontend"

# Install dependencies (if needed)
npm install

# Start the React development server
npm start
```

### Step 2: Backend Startup (If Not Running)
Open another terminal/command prompt and run:

```bash
# Navigate to backend directory  
cd "c:\Users\tsohail\Downloads\NFT final project latest\contracts\backend"

# Start the backend server
node server.js
```

### Step 3: Verify Services
After starting both servers, check these URLs:

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **API Content**: http://localhost:3000/api/media

### Step 4: Common Issues & Solutions

#### Issue 1: Port Already in Use
```bash
# Check what's running on ports
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Kill processes if needed (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Issue 2: Node Modules Issues
```bash
# In frontend directory
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Issue 3: React Version Compatibility
If you see Web3 compatibility warnings, the app should still work fine.

### Step 5: Test Platform Features

Once both servers are running:

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Switch to Sepolia**: Make sure MetaMask is on Sepolia testnet
3. **Upload Content**: Use the upload section to add files
4. **Verify Content**: Check file authenticity
5. **View Gallery**: See uploaded content with verification status

### Your Platform Status:
✅ Smart Contracts: Deployed on Sepolia testnet
✅ Backend API: MongoDB Atlas connected (3 records)
✅ IPFS Storage: Helia integration ready
✅ Database: Working with existing content
✅ Blockchain: Connected to Sepolia testnet

### Contract Addresses:
- **Media Registry**: 0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1
- **NFT Minting**: 0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E  
- **License Manager**: 0x2A9296ea885e84AcCD1b3af984C433424Da02FdB

### If Still Having Issues:
1. Check Windows Firewall settings
2. Try different ports (update package.json scripts)
3. Run as Administrator
4. Check antivirus software blocking connections

## 🎯 Your Platform is Ready!
Once frontend starts, you have a fully functional NFT Content Authentication Platform meeting all Phase 3 & 4 deliverables!
