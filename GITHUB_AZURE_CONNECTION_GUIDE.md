# GitHub Personal Access Token Setup for Azure Deployment

## Step 1: Create Personal Access Token
1. Go to GitHub: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Azure Deployment Token"
4. Select scopes:
   ✅ repo (Full control of private repositories)
   ✅ workflow (Update GitHub Action workflows)
   ✅ read:packages (Download packages from GitHub Package Registry)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

## Step 2: Use Token in Azure
When creating Azure Static Web App or App Service:
- Instead of OAuth, choose "Other" or "External Git"
- Repository URL: https://github.com/tahasohail12/contracts.git
- Branch: main
- Personal Access Token: [paste your token here]

## Step 3: Alternative - Add Token to Azure DevOps
1. Go to Azure DevOps: https://dev.azure.com
2. Create new project
3. Go to Project Settings → Service connections
4. Create new GitHub connection using PAT
5. Use this connection for deployments

## Important Notes:
- Keep your token secure and private
- Set token expiration (recommend 90 days)
- You can regenerate tokens if needed
- Test the connection before proceeding
