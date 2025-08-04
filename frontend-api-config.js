// API Configuration for Vercel Deployment
// Place this in frontend/src/config/api.js

const config = {
  development: {
    API_BASE_URL: 'http://localhost:8080/api',
    BLOCKCHAIN_NETWORK: 'sepolia'
  },
  production: {
    API_BASE_URL: '/api', // Vercel serverless functions
    BLOCKCHAIN_NETWORK: 'sepolia'
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_CONFIG = {
  BASE_URL: config[environment].API_BASE_URL,
  BLOCKCHAIN_NETWORK: config[environment].BLOCKCHAIN_NETWORK,
  
  // API Endpoints
  ENDPOINTS: {
    UPLOAD: '/upload',
    REGISTER: '/register',
    VERIFY: '/verify',
    METADATA: '/metadata',
    HEALTH: '/health',
    FILES: '/files',
    SEARCH: '/search'
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

export default API_CONFIG;
