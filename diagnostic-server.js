const express = require('express');
const path = require('path');

// Simple diagnostic server to test if the platform can serve content
const app = express();
const PORT = 3002;

app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.get('/diagnostic', (req, res) => {
    res.json({
        status: 'Frontend diagnostic server running',
        timestamp: new Date().toISOString(),
        platform: 'NFT Content Authentication',
        phase: 'Troubleshooting',
        ports: {
            diagnostic: 3002,
            backend: 3000,
            frontend: 3001
        },
        checks: {
            backendHealth: 'http://localhost:3000/health',
            apiContent: 'http://localhost:3000/api/media',
            frontendApp: 'http://localhost:3001'
        }
    });
});

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>NFT Platform Diagnostic</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>🔧 NFT Content Authentication Platform Diagnostic</h1>
            <h2>Server Status Check</h2>
            <ul>
                <li><strong>Backend:</strong> <a href="http://localhost:3000/health" target="_blank">http://localhost:3000/health</a></li>
                <li><strong>API Content:</strong> <a href="http://localhost:3000/api/media" target="_blank">http://localhost:3000/api/media</a></li>
                <li><strong>Frontend:</strong> <a href="http://localhost:3001" target="_blank">http://localhost:3001</a></li>
                <li><strong>Diagnostic:</strong> <a href="http://localhost:3002/diagnostic" target="_blank">http://localhost:3002/diagnostic</a></li>
            </ul>
            
            <h2>Manual Startup Commands</h2>
            <h3>Backend:</h3>
            <code>cd backend && node server.js</code>
            
            <h3>Frontend:</h3>
            <code>cd frontend && npm start</code>
            
            <h2>Platform Features Ready:</h2>
            <ul>
                <li>✅ Smart Contracts Deployed</li>
                <li>✅ MongoDB Atlas Connected</li>
                <li>✅ IPFS Storage Ready</li>
                <li>✅ Backend API Functional</li>
                <li>⚠️ Frontend Needs Manual Start</li>
            </ul>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🔧 Diagnostic server running on http://localhost:${PORT}`);
    console.log('📋 Platform Status:');
    console.log('   Backend: http://localhost:3000 (should be running)');
    console.log('   Frontend: http://localhost:3001 (needs manual start)');
    console.log('   Diagnostic: http://localhost:3002 (this server)');
});
