# GitHub Pages + Free Backend Deployment

## Frontend: GitHub Pages (100% Free)

### Step 1: Prepare Frontend for GitHub Pages
1. Build your React app:
   ```bash
   cd frontend
   npm run build
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add to package.json:
   ```json
   {
     "homepage": "https://tahasohail12.github.io/contracts",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Backend: Multiple Free Options

### Option A: Railway (5GB Free, $5/month after)
1. Sign up: https://railway.app
2. Connect GitHub
3. Deploy backend folder
4. Add environment variables
5. Get free subdomain

### Option B: Render (750 hours free/month)
1. Sign up: https://render.com
2. Create Web Service
3. Connect GitHub repo
4. Set build/start commands
5. Add environment variables

### Option C: Cyclic (Free tier available)
1. Sign up: https://cyclic.sh
2. Connect GitHub
3. Deploy Node.js app
4. Configure environment

### Option D: Glitch (Free with limitations)
1. Go to: https://glitch.com
2. Import from GitHub
3. Edit .env file
4. App stays active with usage

## Frontend Configuration Update

Update your frontend API endpoints:
```javascript
// In your React app
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.railway.app'  // or render/cyclic URL
  : 'http://localhost:3000';
```
