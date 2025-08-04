@echo off
REM NFT Content Authentication Platform - Quick Setup Script for Windows
REM This script automates the initial setup process

echo 🚀 NFT Content Authentication Platform - Quick Setup
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

echo.
echo 📦 Installing root dependencies...
npm install

echo.
echo 🔨 Setting up smart contracts...
npm install --save-dev @nomicfoundation/hardhat-chai-matchers @nomicfoundation/hardhat-ethers @openzeppelin/contracts chai ethers hardhat hardhat-gas-reporter

echo.
echo ⚙️ Compiling smart contracts...
npx hardhat compile

if errorlevel 1 (
    echo ❌ Smart contract compilation failed!
    pause
    exit /b 1
)

echo ✅ Smart contracts compiled successfully!

echo.
echo 🔧 Setting up backend...
cd backend

REM Install backend dependencies
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo ✅ Created backend/.env file from template
    echo ⚠️  IMPORTANT: Please edit backend/.env with your MongoDB and Infura credentials
) else (
    echo ✅ Backend .env file already exists
)

cd ..

echo.
echo 🎨 Setting up frontend...
cd frontend

REM Install frontend dependencies
npm install

if errorlevel 1 (
    echo ❌ Frontend dependency installation failed!
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed successfully!

cd ..

echo.
echo 🧪 Running integration tests...
node integration-test.js

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 📋 Next Steps:
echo 1. Edit backend\.env with your MongoDB Atlas and Infura credentials
echo 2. Start the backend: cd backend ^&^& npm start
echo 3. Start the frontend: cd frontend ^&^& npm start
echo 4. Open http://localhost:3001 in your browser
echo.
echo 📚 For detailed instructions, see SETUP_GUIDE.md
echo.
echo 🔗 Important URLs:
echo    Frontend: http://localhost:3001
echo    Backend API: http://localhost:3000
echo    Backend Health: http://localhost:3000/health
echo.
pause
