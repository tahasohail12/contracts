require('dotenv').config();
const { getNetworkInfo, mediaRegistryContract, nftMintingContract, licenseManagerContract } = require('../utils/contracts');

async function displayBlockchainInfo() {
    try {
        console.log('🔗 Blockchain Connection Info');
        console.log('================================');
        
        // Get network information
        const networkInfo = await getNetworkInfo();
        console.log(`📡 Network: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);
        console.log(`💼 Wallet Address: ${networkInfo.walletAddress}`);
        console.log(`💰 Balance: ${networkInfo.balance} ETH`);
        
        console.log('\n📄 Smart Contract Information');
        console.log('================================');
        
        // MediaRegistry info
        try {
            const mediaCount = await mediaRegistryContract.mediaCount();
            console.log(`📋 MediaRegistry: ${await mediaRegistryContract.getAddress()}`);
            console.log(`   - Total Media Registered: ${mediaCount}`);
        } catch (error) {
            console.log(`❌ MediaRegistry: Error - ${error.message}`);
        }
        
        // NFTMinting info
        try {
            const tokenCount = await nftMintingContract.tokenIdCounter();
            const nftName = await nftMintingContract.name();
            const nftSymbol = await nftMintingContract.symbol();
            console.log(`🎨 NFTMinting: ${await nftMintingContract.getAddress()}`);
            console.log(`   - Collection: ${nftName} (${nftSymbol})`);
            console.log(`   - Total NFTs Minted: ${tokenCount}`);
        } catch (error) {
            console.log(`❌ NFTMinting: Error - ${error.message}`);
        }
        
        // LicenseManager info
        try {
            console.log(`📜 LicenseManager: ${await licenseManagerContract.getAddress()}`);
            console.log(`   - Contract deployed and accessible`);
        } catch (error) {
            console.log(`❌ LicenseManager: Error - ${error.message}`);
        }
        
        console.log('\n✅ Blockchain connection test completed!');
        
    } catch (error) {
        console.error('❌ Error connecting to blockchain:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    displayBlockchainInfo()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Script error:', error);
            process.exit(1);
        });
}

module.exports = { displayBlockchainInfo };
