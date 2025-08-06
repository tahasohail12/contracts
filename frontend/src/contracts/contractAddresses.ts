// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Sepolia testnet
  11155111: {
    MediaNFTMarketplace: '0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E', // Replace with actual deployed address
    ContentAuthenticator: '0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1',
    LicenseManager: '0x2A9296ea885e84AcCD1b3af984C433424Da02FdB'
  },
  // Add other networks as needed
  1: {
    // Mainnet addresses (when deployed)
    MediaNFTMarketplace: '',
    ContentAuthenticator: '',
    LicenseManager: ''
  }
};

export const SUPPORTED_NETWORKS = {
  11155111: 'Sepolia Testnet',
  1: 'Ethereum Mainnet'
};
