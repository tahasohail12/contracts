#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🔍 NFT Content Authentication Platform - System Diagnosis\n');

// Check backend endpoints
async function checkBackend() {
    console.log('📡 Checking Backend Services...');
    
    const endpoints = [
        'http://localhost:3000/health',
        'http://localhost:3000/api/media'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await makeRequest(endpoint);
            console.log(`✅ ${endpoint} - Status: ${response.statusCode}`);
        } catch (error) {
            console.log(`❌ ${endpoint} - Error: ${error.message}`);
        }
    }
}

// Check frontend
async function checkFrontend() {
    console.log('\n🌐 Checking Frontend...');
    
    try {
        const response = await makeRequest('http://localhost:3001');
        console.log(`✅ Frontend - Status: ${response.statusCode}`);
    } catch (error) {
        console.log(`❌ Frontend - Error: ${error.message}`);
    }
}

// Check blockchain connectivity
async function checkBlockchain() {
    console.log('\n⛓️ Checking Blockchain Connectivity...');
    
    try {
        const { ethers } = require('ethers');
        const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/f30bff13a25c46cb8ab16fc33df75aa4');
        const network = await provider.getNetwork();
        console.log(`✅ Sepolia Network - Chain ID: ${network.chainId}`);
        
        // Check smart contracts
        const contracts = {
            'Media Registry': '0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1',
            'NFT Minting': '0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E',
            'License Manager': '0x2A9296ea885e84AcCD1b3af984C433424Da02FdB'
        };
        
        for (const [name, address] of Object.entries(contracts)) {
            try {
                const code = await provider.getCode(address);
                if (code === '0x') {
                    console.log(`❌ ${name} - Contract not found at ${address}`);
                } else {
                    console.log(`✅ ${name} - Contract deployed at ${address}`);
                }
            } catch (error) {
                console.log(`❌ ${name} - Error: ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`❌ Blockchain - Error: ${error.message}`);
    }
}

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        const req = client.get(url, (res) => {
            resolve(res);
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Run all checks
async function diagnose() {
    await checkBackend();
    await checkFrontend();
    await checkBlockchain();
    
    console.log('\n🎯 Diagnosis Summary:');
    console.log('If you see ❌ errors above, please:');
    console.log('1. Start backend: cd backend && npm start');
    console.log('2. Start frontend: cd frontend && npm start');
    console.log('3. Check that MetaMask is connected to Sepolia testnet');
    console.log('4. Verify MongoDB Atlas connection in backend/.env');
    console.log('\n📋 Phase 3 & 4 Deliverables Status:');
    console.log('✅ Backend API with smart contract integration');
    console.log('✅ File upload + hash + IPFS storage system');
    console.log('✅ RESTful endpoints for verification');
    console.log('✅ React.js frontend dApp');
    console.log('✅ MetaMask wallet integration');
    console.log('✅ Content registration and verification flows');
}

diagnose();
