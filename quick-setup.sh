#!/bin/bash

# NFT Content Authentication Platform - Quick Setup Script
# This script automates the initial setup process

echo "🚀 NFT Content Authentication Platform - Quick Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

echo ""
echo "📦 Installing root dependencies..."
npm install

echo ""
echo "🔨 Setting up smart contracts..."
npm install --save-dev @nomicfoundation/hardhat-chai-matchers @nomicfoundation/hardhat-ethers @openzeppelin/contracts chai ethers hardhat hardhat-gas-reporter

echo ""
echo "⚙️ Compiling smart contracts..."
npx hardhat compile

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts compiled successfully!"
else
    echo "❌ Smart contract compilation failed!"
    exit 1
fi

echo ""
echo "🔧 Setting up backend..."
cd backend

# Install backend dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend/.env file from template"
    echo "⚠️  IMPORTANT: Please edit backend/.env with your MongoDB and Infura credentials"
else
    echo "✅ Backend .env file already exists"
fi

cd ..

echo ""
echo "🎨 Setting up frontend..."
cd frontend

# Install frontend dependencies
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully!"
else
    echo "❌ Frontend dependency installation failed!"
    exit 1
fi

cd ..

echo ""
echo "🧪 Running integration tests..."
node integration-test.js

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your MongoDB Atlas and Infura credentials"
echo "2. Start the backend: cd backend && npm start"
echo "3. Start the frontend: cd frontend && npm start"
echo "4. Open http://localhost:3001 in your browser"
echo ""
echo "📚 For detailed instructions, see SETUP_GUIDE.md"
echo ""
echo "🔗 Important URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   Backend Health: http://localhost:3000/health"
