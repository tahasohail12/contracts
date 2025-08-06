// Minimal ABI for MediaNFTMarketplace contract
export const MEDIA_NFT_MARKETPLACE_ABI = [
  // View functions
  "function getMediaAsset(uint256 tokenId) view returns (tuple(string contentHash, string ipfsHash, string metadata, address creator, uint256 createdAt, bool isForSale, uint256 price, uint256 royaltyPercentage))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getCreatorAssets(address creator) view returns (uint256[])",
  "function hasValidLicense(uint256 tokenId, address user, uint8 licenseType) view returns (bool)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  
  // Write functions
  "function mintContentNFT(address to, string contentHash, string ipfsHash, string metadata, string uri, uint96 royaltyPercentage) returns (uint256)",
  "function listForSale(uint256 tokenId, uint256 price)",
  "function removeFromSale(uint256 tokenId)",
  "function buyNFT(uint256 tokenId) payable",
  "function grantLicense(uint256 tokenId, address licensee, uint8 licenseType, uint256 duration, uint256 licensePrice) payable",
  "function rentNFT(uint256 tokenId, uint256 duration) payable",
  
  // Events
  "event MediaMinted(uint256 indexed tokenId, address indexed creator, string contentHash)",
  "event MediaListed(uint256 indexed tokenId, uint256 price)",
  "event MediaSold(uint256 indexed tokenId, address indexed buyer, uint256 price)",
  "event LicenseGranted(uint256 indexed tokenId, address indexed licensee, uint8 licenseType, uint256 expirationTime)",
  "event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount)"
];

// License types enum (matches smart contract)
export const LICENSE_TYPES = {
  PERSONAL: 0,
  COMMERCIAL: 1,
  EXCLUSIVE: 2,
  RENTAL: 3
};
