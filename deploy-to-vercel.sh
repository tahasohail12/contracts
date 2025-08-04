#!/bin/bash

echo "🚀 Preparing NFT Content Authentication Platform for Vercel Deployment"
echo "=================================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps

echo "🔨 Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

cd ..

echo "📝 Checking git status..."
git status

echo ""
echo "🎉 Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Commit and push any changes: git add . && git commit -m 'Prepare for Vercel deployment' && git push"
echo "2. Go to vercel.com and import your GitHub repository"
echo "3. Deploy the frontend folder specifically"
echo "4. Set environment variables in Vercel dashboard"
echo ""
