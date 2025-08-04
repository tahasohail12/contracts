# Free Azure Deployment Without Resource Group Permissions

## Option 1: Direct Azure Static Web Apps Deployment

### Step 1: Deploy Frontend Only (Free)
1. Go to: https://portal.azure.com
2. Click "Create a resource"
3. Search for "Static Web Apps"
4. Click "Create"
5. Use EXISTING resource group or let Azure create one automatically
6. Configuration:
   - Name: nft-content-auth-frontend
   - Region: (any available)
   - Source: GitHub
   - Repository: tahasohail12/contracts
   - Branch: main
   - Build Details:
     * App location: /frontend
     * Output location: build

### Step 2: Use Free Backend Alternatives

Since you can't create App Service, use these free options:

#### A) Vercel (Recommended for Node.js)
1. Go to: https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Configure:
   - Framework: Other
   - Root Directory: backend
   - Build Command: npm install
   - Output Directory: (leave empty)
   - Install Command: npm install

#### B) Railway
1. Go to: https://railway.app
2. Sign up with GitHub
3. Deploy from GitHub repo
4. Select backend folder
5. Add environment variables

#### C) Render
1. Go to: https://render.com
2. Sign up with GitHub
3. Create Web Service
4. Connect GitHub repo
5. Configure:
   - Environment: Node
   - Build Command: cd backend && npm install
   - Start Command: cd backend && npm start

### Step 3: Update Frontend to Point to New Backend
Update your frontend API calls to point to the new backend URL.
