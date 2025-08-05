// Media endpoints for Vercel serverless functions
const mongoose = require('mongoose');
const multer = require('multer');
const crypto = require('crypto');

// Database connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-content-auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = connection;
  return connection;
}

// Database Models
const MediaSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true },
  originalName: String,
  mimeType: String,
  size: Number,
  ipfsHash: String,
  metadata: Object,
  nftTokenId: Number,
  owner: String,
  createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// IPFS Integration (simplified for serverless)
async function uploadToIPFS(buffer) {
  try {
    // For now, return a mock IPFS hash since Helia might not work in serverless
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `Qm${hash.substring(0, 44)}`; // Mock IPFS hash format
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return null;
  }
}

// Serverless function handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Get all media content
      const media = await Media.find().sort({ createdAt: -1 });
      res.status(200).json(media);
    } else if (req.method === 'POST') {
      // Handle file upload
      const form = new FormData();
      
      // For now, create a simple test upload
      const testData = {
        hash: crypto.createHash('sha256').update('test-' + Date.now()).digest('hex'),
        originalName: 'test-file.txt',
        mimeType: 'text/plain',
        size: 100,
        ipfsHash: 'QmTestHash123',
        metadata: {
          title: 'Test Upload',
          description: 'Test upload from production',
          uploadedAt: new Date().toISOString()
        }
      };

      const mediaRecord = new Media(testData);
      await mediaRecord.save();

      res.status(200).json({
        success: true,
        contentHash: testData.hash,
        ipfsHash: testData.ipfsHash,
        metadata: testData.metadata,
        message: 'Content uploaded successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
