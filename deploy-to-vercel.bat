@echo off
echo 🚀 Preparing NFT Content Authentication Platform for Vercel Deployment
echo ==================================================================

if not exist package.json (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

echo 📦 Installing root dependencies...
call npm install

echo 📦 Installing frontend dependencies...
cd frontend
call npm install --legacy-peer-deps

echo 🔨 Building frontend for production...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    exit /b 1
)

echo ✅ Frontend build successful!
cd ..

echo 📝 Checking git status...
git status

echo.
echo 🎉 Ready for Vercel deployment!
echo.
echo Next steps:
echo 1. Commit and push any changes: git add . ^&^& git commit -m "Prepare for Vercel deployment" ^&^& git push
echo 2. Go to vercel.com and import your GitHub repository
echo 3. Deploy the frontend folder specifically
echo 4. Set environment variables in Vercel dashboard
echo.

pause
