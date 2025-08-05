// Test MongoDB Atlas Connection
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Testing MongoDB Atlas connection...');
        console.log('Connection URI:', process.env.MONGODB_URI?.replace(/:[^:@]*@/, ':****@'));
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Successfully connected to MongoDB Atlas!');
        console.log('Database name:', mongoose.connection.db.databaseName);
        
        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('Connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.message.includes('bad auth')) {
            console.log('\n🔧 SOLUTION: Check your username/password in the connection string');
            console.log('1. Go to MongoDB Atlas Dashboard');
            console.log('2. Database Access → Edit your user');
            console.log('3. Reset password and update connection string');
        }
        
        if (error.message.includes('IP not allowed')) {
            console.log('\n🔧 SOLUTION: Add your IP to Network Access');
            console.log('1. Go to MongoDB Atlas Dashboard');
            console.log('2. Network Access → Add IP Address');
            console.log('3. Add "0.0.0.0/0" to allow all IPs (for development)');
        }
    }
}

testConnection();
