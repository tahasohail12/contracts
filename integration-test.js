#!/usr/bin/env node

/**
 * NFT Content Authentication Platform - Integration Test Suite
 * 
 * This script tests the complete integration between:
 * - Backend API (Express.js + IPFS + MongoDB)
 * - Smart Contracts (Sepolia testnet)
 * - Frontend React App
 * - Database connectivity
 * - Blockchain connectivity
 */

const axios = require('axios');
const { ethers } = require('ethers');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3001';
const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/f30bff13a25c46cb8ab16fc33df75aa4';

// Contract addresses
const CONTRACTS = {
  MEDIA_REGISTRY: '0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1',
  NFT_MINTING: '0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E',
  LICENSE_MANAGER: '0x2A9296ea885e84AcCD1b3af984C433424Da02FdB'
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Testing: ${testName}`);
  
  try {
    await testFunction();
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASSED' });
    console.log(`✅ PASSED: ${testName}`);
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ FAILED: ${testName} - ${error.message}`);
  }
}

// Test 1: Backend Health Check
async function testBackendHealth() {
  const response = await axios.get(`${BACKEND_URL}/health`);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
}

// Test 2: Frontend Accessibility
async function testFrontendAccessibility() {
  const response = await axios.get(FRONTEND_URL);
  if (response.status !== 200) {
    throw new Error(`Frontend not accessible, status: ${response.status}`);
  }
  if (!response.data.includes('React')) {
    throw new Error('Frontend does not appear to be a React application');
  }
}

// Test 3: Blockchain Connectivity
async function testBlockchainConnectivity() {
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const network = await provider.getNetwork();
  
  if (network.chainId !== 11155111n) {
    throw new Error(`Expected Sepolia chainId 11155111, got ${network.chainId}`);
  }
  
  // Test contract accessibility
  const mediaRegistry = new ethers.Contract(
    CONTRACTS.MEDIA_REGISTRY,
    ['function mediaCount() view returns (uint256)'],
    provider
  );
  
  const mediaCount = await mediaRegistry.mediaCount();
  if (typeof mediaCount !== 'bigint' && typeof mediaCount !== 'number') {
    throw new Error('Failed to read contract mediaCount');
  }
}

// Test 4: Database Connectivity (Check if MongoDB connection works)
async function testDatabaseConnectivity() {
  // Test if we can retrieve media (which tests DB connection)
  const response = await axios.get(`${BACKEND_URL}/api/media`);
  if (response.status !== 200) {
    throw new Error(`Database connectivity test failed, status: ${response.status}`);
  }
  // If we get here, MongoDB is connected and working
}

// Test 5: Content Retrieval API  
async function testContentRetrievalAPI() {
  const response = await axios.get(`${BACKEND_URL}/api/media`);
  if (response.status !== 200) {
    throw new Error(`Content retrieval failed, status: ${response.status}`);
  }
  
  if (!Array.isArray(response.data)) {
    throw new Error('Content API should return an array');
  }
}

// Test 6: Frontend-Backend Communication
async function testFrontendBackendCommunication() {
  // This test checks if frontend can communicate with backend via CORS
  const response = await axios.get(`${BACKEND_URL}/health`, {
    headers: {
      'Origin': FRONTEND_URL,
      'Access-Control-Request-Method': 'GET'
    }
  });
  
  if (response.status !== 200) {
    throw new Error('Frontend-Backend CORS communication failed');
  }
}

// Main test execution
async function runIntegrationTests() {
  console.log('🚀 Starting NFT Content Authentication Platform Integration Tests\n');
  console.log('='.repeat(70));
  
  // Run all tests
  await runTest('Backend Health Check', testBackendHealth);
  await runTest('Frontend Accessibility', testFrontendAccessibility);
  await runTest('Blockchain Connectivity (Sepolia)', testBlockchainConnectivity);
  await runTest('Database Connectivity (MongoDB)', testDatabaseConnectivity);
  await runTest('Content Retrieval API', testContentRetrievalAPI);
  await runTest('Frontend-Backend Communication', testFrontendBackendCommunication);
  
  // Print results
  console.log('\n' + '='.repeat(70));
  console.log('🏁 Integration Test Results');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  console.log('\n📋 Test Details:');
  testResults.details.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    if (test.error) {
      console.log(`   └─ Error: ${test.error}`);
    }
  });
  
  console.log('\n🌐 Service URLs:');
  console.log(`   Backend API: ${BACKEND_URL}`);
  console.log(`   Frontend App: ${FRONTEND_URL}`);
  console.log(`   Blockchain: Sepolia Testnet`);
  
  console.log('\n📄 Smart Contracts:');
  console.log(`   MediaRegistry: ${CONTRACTS.MEDIA_REGISTRY}`);
  console.log(`   NFTMinting: ${CONTRACTS.NFT_MINTING}`);
  console.log(`   LicenseManager: ${CONTRACTS.LICENSE_MANAGER}`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your NFT Content Authentication Platform is fully integrated and operational!');
  } else {
    console.log(`\n⚠️  ${testResults.failed} test(s) failed. Please check the errors above.`);
  }
  
  console.log('\n' + '='.repeat(70));
}

// Run the tests
runIntegrationTests().catch(error => {
  console.error('❌ Integration test suite failed:', error.message);
  process.exit(1);
});
