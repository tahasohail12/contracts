const { ethers } = require('ethers');

// Blockchain configuration
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

// Smart contract addresses
const MEDIA_REGISTRY_ADDRESS = process.env.MEDIA_REGISTRY_ADDRESS || '0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1';
const NFT_MINTING_ADDRESS = process.env.NFT_MINTING_ADDRESS || '0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E';
const LICENSE_MANAGER_ADDRESS = process.env.LICENSE_MANAGER_ADDRESS || '0x2A9296ea885e84AcCD1b3af984C433424Da02FdB';

// Contract ABIs
const MEDIA_REGISTRY_ABI = [
    "function registerMedia(string memory _hash, string memory _metadata) public",
    "function mediaRegistry(uint256) public view returns (string memory hash, string memory metadata)",
    "function mediaCount() public view returns (uint256)"
];

const NFT_MINTING_ABI = [
    "function mintNFT(address to) public",
    "function tokenIdCounter() public view returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function name() public view returns (string)",
    "function symbol() public view returns (string)"
];

const LICENSE_MANAGER_ABI = [
    "function buyLicense(uint256 _mediaId) public payable",
    "function transferLicense(uint256 _mediaId, address _to) public",
    "function licenseOwners(uint256) public view returns (address)"
];

// Contract instances
const mediaRegistryContract = new ethers.Contract(MEDIA_REGISTRY_ADDRESS, MEDIA_REGISTRY_ABI, wallet);
const nftMintingContract = new ethers.Contract(NFT_MINTING_ADDRESS, NFT_MINTING_ABI, wallet);
const licenseManagerContract = new ethers.Contract(LICENSE_MANAGER_ADDRESS, LICENSE_MANAGER_ABI, wallet);

// Utility functions
async function getNetworkInfo() {
    try {
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(wallet.address);
        
        return {
            chainId: network.chainId,
            name: network.name,
            walletAddress: wallet.address,
            balance: ethers.formatEther(balance)
        };
    } catch (error) {
        console.error('Error getting network info:', error);
        throw error;
    }
}

async function waitForTransaction(txHash, confirmations = 1) {
    try {
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            throw new Error('Transaction not found');
        }
        
        const receipt = await tx.wait(confirmations);
        return receipt;
    } catch (error) {
        console.error('Error waiting for transaction:', error);
        throw error;
    }
}

module.exports = {
    provider,
    wallet,
    mediaRegistryContract,
    nftMintingContract,
    licenseManagerContract,
    getNetworkInfo,
    waitForTransaction,
    addresses: {
        MEDIA_REGISTRY_ADDRESS,
        NFT_MINTING_ADDRESS,
        LICENSE_MANAGER_ADDRESS
    }
};
