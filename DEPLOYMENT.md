# Deployment Guide

This guide covers deployment options for the NFT Content Authentication Platform.

## Prerequisites

1. **Environment Variables**: Copy `.env.example` to `.env` and configure your values
2. **MongoDB Atlas**: Ensure your MongoDB cluster is accessible from deployment platform
3. **Smart Contracts**: Verify contracts are deployed on Sepolia testnet
4. **MetaMask**: Users need MetaMask extension for wallet connection

## Platform-Specific Deployment

### 1. Vercel (Recommended for Frontend)

#### Frontend Deployment
```bash
cd frontend
npm run build
npm install -g vercel
vercel
```

#### Configuration
- Framework Preset: Create React App
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `build`

#### Environment Variables (Vercel)
Add in Vercel dashboard:
- `REACT_APP_API_URL`: Your backend URL
- `REACT_APP_NETWORK`: sepolia

### 2. Railway (Backend)

#### Setup
1. Connect GitHub repository to Railway
2. Select root directory (not frontend)
3. Set start command: `node server.js`

#### Environment Variables
- `MONGODB_URI`: Your MongoDB connection string
- `PORT`: 3000 (Railway will override)
- `NODE_ENV`: production
- `FRONTEND_URL`: Your Vercel frontend URL

### 3. Heroku (Alternative)

#### Backend Deployment
```bash
heroku create your-nft-platform-api
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set NODE_ENV=production
git push heroku main
```

#### Frontend (Heroku with buildpack)
```bash
heroku create your-nft-platform-frontend
heroku buildpacks:add mars/create-react-app
heroku config:set REACT_APP_API_URL=your-backend-url
cd frontend && git push heroku main
```

### 4. Netlify (Frontend Alternative)

#### Setup
1. Connect GitHub repository
2. Set build directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/build`

#### Environment Variables
- `REACT_APP_API_URL`: Your backend URL
- `REACT_APP_NETWORK`: sepolia

### 5. DigitalOcean App Platform

#### Backend
```yaml
name: nft-backend
services:
- name: api
  source_dir: /
  github:
    repo: your-username/contracts
    branch: main
  run_command: node server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: MONGODB_URI
    value: your-mongodb-uri
  - key: NODE_ENV
    value: production
```

#### Frontend
```yaml
name: nft-frontend
static_sites:
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/contracts
    branch: main
  build_command: npm run build
  output_dir: /build
  envs:
  - key: REACT_APP_API_URL
    value: your-backend-url
```

## Environment Configuration

### Backend Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nft-content-auth
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_NETWORK=sepolia
```

## Post-Deployment Checklist

### 1. Test Backend API
```bash
curl https://your-backend-url.com/api/health
```

### 2. Test Frontend
- Open your frontend URL
- Check console for errors
- Test wallet connection
- Try uploading a test file

### 3. CORS Configuration
Ensure your backend allows requests from your frontend domain:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001'
}));
```

### 4. Database Connection
- Verify MongoDB Atlas allows connections from deployment platform
- Check database connection in deployment logs

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update FRONTEND_URL environment variable
   - Check CORS configuration in server.js

2. **Database Connection Failed**
   - Verify MongoDB URI format
   - Check IP whitelist in MongoDB Atlas
   - Ensure credentials are correct

3. **Smart Contract Connection Issues**
   - Verify contract addresses in Web3Provider.tsx
   - Ensure Sepolia testnet is properly configured
   - Check if user has Sepolia ETH

4. **Build Failures**
   - Check all dependencies are listed in package.json
   - Verify TypeScript errors are resolved
   - Ensure build directory is correct

5. **Environment Variables Not Loading**
   - Verify variable names match exactly
   - Check deployment platform's environment variable format
   - Restart deployment after adding variables

## Security Considerations

1. **Environment Variables**: Never commit .env files
2. **MongoDB**: Use strong passwords and IP restrictions
3. **CORS**: Only allow your frontend domain
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Consider adding API rate limiting

## Monitoring

### Health Check Endpoint
```
GET /api/health
```

### Database Monitoring
- Monitor MongoDB Atlas dashboard
- Set up alerts for connection issues
- Track database performance metrics

### Application Monitoring
- Check deployment platform logs
- Monitor API response times
- Track error rates

## Scaling Considerations

1. **Database**: MongoDB Atlas auto-scaling
2. **Backend**: Horizontal scaling via platform load balancers
3. **Frontend**: CDN for global distribution
4. **IPFS**: Consider dedicated IPFS providers for production

## Cost Optimization

1. **Start Small**: Use free tiers for testing
2. **Monitor Usage**: Track database and bandwidth usage
3. **Optimize Builds**: Use build caching where available
4. **CDN**: Use CDNs for static assets

## Backup Strategy

1. **Database**: Regular MongoDB backups
2. **Code**: Git repository as source of truth
3. **Environment**: Document all environment variables
4. **Smart Contracts**: Keep contract addresses and ABIs safe
