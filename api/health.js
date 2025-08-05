// Health check endpoint for Vercel
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: 'production'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
