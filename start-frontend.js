#!/usr/bin/env node

/**
 * Frontend Troubleshooting Script
 * Identifies and fixes common React frontend issues
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 Frontend Troubleshooting Script');
console.log('===================================\n');

// Check if we're in the right directory
const frontendPath = path.join(process.cwd(), 'frontend');
if (!fs.existsSync(frontendPath)) {
    console.log('❌ Frontend directory not found. Make sure you\'re in the project root.');
    process.exit(1);
}

console.log('📁 Frontend directory found');

// Check package.json
const packageJsonPath = path.join(frontendPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found in frontend directory');
    process.exit(1);
}

console.log('📦 package.json found');

// Check node_modules
const nodeModulesPath = path.join(frontendPath, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  node_modules not found. Installing dependencies...');
    
    const npmInstall = spawn('npm', ['install'], {
        cwd: frontendPath,
        stdio: 'inherit',
        shell: true
    });
    
    npmInstall.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Dependencies installed successfully');
            startServer();
        } else {
            console.log('❌ Failed to install dependencies');
        }
    });
} else {
    console.log('✅ node_modules found');
    startServer();
}

function startServer() {
    console.log('\n🚀 Starting React development server...');
    console.log('📝 Note: The server will start on http://localhost:3001');
    console.log('📝 Backend should be running on http://localhost:3000');
    console.log('📝 Press Ctrl+C to stop the server\n');
    
    const npmStart = spawn('npm', ['start'], {
        cwd: frontendPath,
        stdio: 'inherit',
        shell: true
    });
    
    npmStart.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Frontend server started successfully');
        } else {
            console.log('❌ Frontend server failed to start');
            console.log('💡 Try the following:');
            console.log('   1. Delete node_modules and package-lock.json');
            console.log('   2. Run npm install');
            console.log('   3. Run npm start');
        }
    });
    
    npmStart.on('error', (error) => {
        console.log('❌ Error starting server:', error.message);
    });
}

console.log('✅ Troubleshooting checks completed');
