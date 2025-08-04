// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MediaNFTMarketplace
 * @dev Enhanced NFT contract with marketplace functionality and licensing
 */
contract MediaNFTMarketplace is ERC721, Ownable, ReentrancyGuard {
    
    struct MediaAsset {
        string contentHash;
        string ipfsHash;
        string metadata;
        address creator;
        uint256 createdAt;
        bool isForSale;
        uint256 price;
        uint256 royaltyPercentage; // in basis points (100 = 1%)
    }
    
    struct License {
        address licensee;
        uint256 tokenId;
        LicenseType licenseType;
        uint256 expirationTime;
        uint256 price;
        bool isActive;
    }
    
    enum LicenseType {
        PERSONAL,
        COMMERCIAL,
        EXCLUSIVE,
        RENTAL
    }
    
    // Mappings
    mapping(uint256 => MediaAsset) public mediaAssets;
    mapping(uint256 => License[]) public tokenLicenses;
    mapping(address => uint256[]) public creatorAssets;
    mapping(string => uint256) public hashToTokenId;
    mapping(uint256 => string) public tokenURIs;
    
    // Counters
    uint256 private _tokenIdCounter;
    
    // Events
    event MediaMinted(uint256 indexed tokenId, address indexed creator, string contentHash);
    event MediaListed(uint256 indexed tokenId, uint256 price);
    event MediaSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event LicenseGranted(uint256 indexed tokenId, address indexed licensee, LicenseType licenseType, uint256 expirationTime);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);
    
    constructor(address initialOwner) 
        ERC721("MediaNFT", "MNFT") 
        Ownable(initialOwner) 
    {}
    
    /**
     * @dev Mint a new NFT for content authentication
     */
    function mintContentNFT(
        address to,
        string memory contentHash,
        string memory ipfsHash,
        string memory metadata,
        string memory uri,
        uint96 royaltyPercentage
    ) public returns (uint256) {
        require(bytes(contentHash).length > 0, "Content hash required");
        require(hashToTokenId[contentHash] == 0, "Content already minted");
        require(royaltyPercentage <= 1000, "Royalty too high"); // Max 10%
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        tokenURIs[tokenId] = uri;
        
        // Set royalty info (simplified without ERC2981)
        // In a real implementation, you might want to store royalty info separately
        
        // Store media asset info
        mediaAssets[tokenId] = MediaAsset({
            contentHash: contentHash,
            ipfsHash: ipfsHash,
            metadata: metadata,
            creator: to,
            createdAt: block.timestamp,
            isForSale: false,
            price: 0,
            royaltyPercentage: royaltyPercentage
        });
        
        // Track creator assets
        creatorAssets[to].push(tokenId);
        hashToTokenId[contentHash] = tokenId;
        
        emit MediaMinted(tokenId, to, contentHash);
        return tokenId;
    }
    
    /**
     * @dev List NFT for sale
     */
    function listForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        
        mediaAssets[tokenId].isForSale = true;
        mediaAssets[tokenId].price = price;
        
        emit MediaListed(tokenId, price);
    }
    
    /**
     * @dev Remove NFT from sale
     */
    function removeFromSale(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        mediaAssets[tokenId].isForSale = false;
        mediaAssets[tokenId].price = 0;
    }
    
    /**
     * @dev Buy NFT
     */
    function buyNFT(uint256 tokenId) public payable nonReentrant {
        MediaAsset storage asset = mediaAssets[tokenId];
        require(asset.isForSale, "NFT not for sale");
        require(msg.value >= asset.price, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        address creator = asset.creator;
        uint256 price = asset.price;
        
        // Calculate royalty
        uint256 royaltyAmount = 0;
        if (creator != seller) {
            royaltyAmount = (price * asset.royaltyPercentage) / 10000;
        }
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Update sale status
        asset.isForSale = false;
        asset.price = 0;
        
        // Pay seller (minus royalty)
        uint256 sellerAmount = price - royaltyAmount;
        if (sellerAmount > 0) {
            payable(seller).transfer(sellerAmount);
        }
        
        // Pay royalty to creator
        if (royaltyAmount > 0) {
            payable(creator).transfer(royaltyAmount);
            emit RoyaltyPaid(tokenId, creator, royaltyAmount);
        }
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit MediaSold(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Grant license for content usage
     */
    function grantLicense(
        uint256 tokenId,
        address licensee,
        LicenseType licenseType,
        uint256 duration, // in seconds
        uint256 licensePrice
    ) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(msg.value >= licensePrice, "Insufficient payment for license");
        
        uint256 expirationTime = block.timestamp + duration;
        
        // Create license
        License memory newLicense = License({
            licensee: licensee,
            tokenId: tokenId,
            licenseType: licenseType,
            expirationTime: expirationTime,
            price: licensePrice,
            isActive: true
        });
        
        tokenLicenses[tokenId].push(newLicense);
        
        // Pay creator royalty
        address creator = mediaAssets[tokenId].creator;
        uint256 royaltyAmount = (licensePrice * mediaAssets[tokenId].royaltyPercentage) / 10000;
        
        if (creator != msg.sender && royaltyAmount > 0) {
            payable(creator).transfer(royaltyAmount);
            emit RoyaltyPaid(tokenId, creator, royaltyAmount);
        }
        
        // Pay owner (minus royalty)
        uint256 ownerAmount = licensePrice - royaltyAmount;
        if (ownerAmount > 0) {
            payable(msg.sender).transfer(ownerAmount);
        }
        
        // Refund excess
        if (msg.value > licensePrice) {
            payable(msg.sender).transfer(msg.value - licensePrice);
        }
        
        emit LicenseGranted(tokenId, licensee, licenseType, expirationTime);
    }
    
    /**
     * @dev Rent NFT for temporary access
     */
    function rentNFT(uint256 tokenId, uint256 duration) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(duration > 0, "Duration must be greater than 0");
        
        MediaAsset storage asset = mediaAssets[tokenId];
        require(asset.isForSale, "NFT not available for rent");
        
        // Calculate rental price (simplified: price per day)
        uint256 dailyRate = asset.price / 30; // Assume monthly price divided by 30
        uint256 rentalPrice = (dailyRate * duration) / 86400; // Convert duration to days
        
        require(msg.value >= rentalPrice, "Insufficient payment for rental");
        
        grantLicense(tokenId, msg.sender, LicenseType.RENTAL, duration, rentalPrice);
    }
    
    /**
     * @dev Check if address has valid license
     */
    function hasValidLicense(uint256 tokenId, address user, LicenseType licenseType) public view returns (bool) {
        License[] memory licenses = tokenLicenses[tokenId];
        
        for (uint i = 0; i < licenses.length; i++) {
            if (licenses[i].licensee == user && 
                licenses[i].licenseType == licenseType && 
                licenses[i].isActive && 
                licenses[i].expirationTime > block.timestamp) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get all assets created by an address
     */
    function getCreatorAssets(address creator) public view returns (uint256[] memory) {
        return creatorAssets[creator];
    }
    
    /**
     * @dev Get media asset info
     */
    function getMediaAsset(uint256 tokenId) public view returns (MediaAsset memory) {
        require(_exists(tokenId), "Token does not exist");
        return mediaAssets[tokenId];
    }
    
    /**
     * @dev Get licenses for a token
     */
    function getTokenLicenses(uint256 tokenId) public view returns (License[] memory) {
        return tokenLicenses[tokenId];
    }
    
    /**
     * @dev Verify content authenticity by hash
     */
    function verifyContentHash(string memory contentHash) public view returns (bool exists, uint256 tokenId, address creator) {
        tokenId = hashToTokenId[contentHash];
        if (tokenId > 0) {
            exists = true;
            creator = mediaAssets[tokenId].creator;
        } else {
            exists = false;
            creator = address(0);
        }
    }
    
    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721: invalid token ID");
        return tokenURIs[tokenId];
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
