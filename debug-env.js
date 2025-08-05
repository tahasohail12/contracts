// Environment check for debugging
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI (masked):', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@') : 'NOT SET');

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mongoUri: process.env.MONGODB_URI };
}
