// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title ContentAuthenticator
 * @dev Advanced content authentication and verification system
 */
contract ContentAuthenticator is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    struct ContentRecord {
        string contentHash;
        string ipfsHash;
        address creator;
        uint256 timestamp;
        string metadata;
        bool isVerified;
        uint256 nftTokenId;
        ContentType contentType;
        bytes creatorSignature;
    }
    
    struct VerificationRequest {
        uint256 requestId;
        string contentHash;
        address requester;
        uint256 timestamp;
        VerificationStatus status;
        string verificationData;
    }
    
    enum ContentType {
        IMAGE,
        VIDEO,
        AUDIO,
        DOCUMENT,
        CODE,
        OTHER
    }
    
    enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        DISPUTED
    }
    
    // Mappings
    mapping(string => ContentRecord) public contentRecords;
    mapping(string => bool) public contentExists;
    mapping(address => string[]) public creatorContent;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(address => bool) public authorizedVerifiers;
    
    // Counters and arrays
    uint256 public verificationRequestCounter;
    string[] public allContentHashes;
    
    // Events
    event ContentRegistered(string indexed contentHash, address indexed creator, uint256 nftTokenId);
    event ContentVerified(string indexed contentHash, address indexed verifier);
    event VerificationRequested(uint256 indexed requestId, string contentHash, address requester);
    event VerificationCompleted(uint256 indexed requestId, VerificationStatus status);
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        // Owner is automatically an authorized verifier
        authorizedVerifiers[initialOwner] = true;
    }
    
    /**
     * @dev Register new content with authentication
     */
    function registerContent(
        string memory contentHash,
        string memory ipfsHash,
        string memory metadata,
        ContentType contentType,
        uint256 nftTokenId,
        bytes memory signature
    ) public returns (bool) {
        require(!contentExists[contentHash], "Content already registered");
        require(bytes(contentHash).length > 0, "Content hash required");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(contentHash, msg.sender));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");
        
        // Create content record
        contentRecords[contentHash] = ContentRecord({
            contentHash: contentHash,
            ipfsHash: ipfsHash,
            creator: msg.sender,
            timestamp: block.timestamp,
            metadata: metadata,
            isVerified: false,
            nftTokenId: nftTokenId,
            contentType: contentType,
            creatorSignature: signature
        });
        
        contentExists[contentHash] = true;
        creatorContent[msg.sender].push(contentHash);
        allContentHashes.push(contentHash);
        
        emit ContentRegistered(contentHash, msg.sender, nftTokenId);
        return true;
    }
    
    /**
     * @dev Verify content authenticity
     */
    function verifyContent(string memory contentHash) public view returns (
        bool exists,
        address creator,
        uint256 timestamp,
        bool isVerified,
        uint256 nftTokenId
    ) {
        if (contentExists[contentHash]) {
            ContentRecord memory record = contentRecords[contentHash];
            return (
                true,
                record.creator,
                record.timestamp,
                record.isVerified,
                record.nftTokenId
            );
        }
        return (false, address(0), 0, false, 0);
    }
    
    /**
     * @dev Request content verification by authorized verifier
     */
    function requestVerification(string memory contentHash, string memory verificationData) public returns (uint256) {
        require(contentExists[contentHash], "Content not registered");
        
        uint256 requestId = verificationRequestCounter++;
        
        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            contentHash: contentHash,
            requester: msg.sender,
            timestamp: block.timestamp,
            status: VerificationStatus.PENDING,
            verificationData: verificationData
        });
        
        emit VerificationRequested(requestId, contentHash, msg.sender);
        return requestId;
    }
    
    /**
     * @dev Complete verification (only authorized verifiers)
     */
    function completeVerification(
        uint256 requestId,
        VerificationStatus status,
        string memory verificationData
    ) public {
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        require(requestId < verificationRequestCounter, "Invalid request ID");
        
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.status == VerificationStatus.PENDING, "Request already processed");
        
        request.status = status;
        request.verificationData = verificationData;
        
        // If verified, update content record
        if (status == VerificationStatus.VERIFIED) {
            contentRecords[request.contentHash].isVerified = true;
            emit ContentVerified(request.contentHash, msg.sender);
        }
        
        emit VerificationCompleted(requestId, status);
    }
    
    /**
     * @dev Batch verify multiple content hashes
     */
    function batchVerifyContent(string[] memory contentHashes) public {
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        
        for (uint i = 0; i < contentHashes.length; i++) {
            if (contentExists[contentHashes[i]]) {
                contentRecords[contentHashes[i]].isVerified = true;
                emit ContentVerified(contentHashes[i], msg.sender);
            }
        }
    }
    
    /**
     * @dev Check if content hash matches expected creator
     */
    function validateCreator(string memory contentHash, address expectedCreator) public view returns (bool) {
        if (!contentExists[contentHash]) {
            return false;
        }
        return contentRecords[contentHash].creator == expectedCreator;
    }
    
    /**
     * @dev Get content metadata
     */
    function getContentMetadata(string memory contentHash) public view returns (
        string memory ipfsHash,
        string memory metadata,
        ContentType contentType,
        uint256 timestamp
    ) {
        require(contentExists[contentHash], "Content not found");
        ContentRecord memory record = contentRecords[contentHash];
        return (record.ipfsHash, record.metadata, record.contentType, record.timestamp);
    }
    
    /**
     * @dev Get all content by creator
     */
    function getCreatorContent(address creator) public view returns (string[] memory) {
        return creatorContent[creator];
    }
    
    /**
     * @dev Get verification request details
     */
    function getVerificationRequest(uint256 requestId) public view returns (VerificationRequest memory) {
        require(requestId < verificationRequestCounter, "Invalid request ID");
        return verificationRequests[requestId];
    }
    
    /**
     * @dev Get total content count
     */
    function getTotalContentCount() public view returns (uint256) {
        return allContentHashes.length;
    }
    
    /**
     * @dev Get content hash by index (for pagination)
     */
    function getContentHashByIndex(uint256 index) public view returns (string memory) {
        require(index < allContentHashes.length, "Index out of bounds");
        return allContentHashes[index];
    }
    
    /**
     * @dev Check content signature validity
     */
    function verifyContentSignature(
        string memory contentHash,
        address expectedSigner,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(contentHash, expectedSigner));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        return recoveredSigner == expectedSigner;
    }
    
    /**
     * @dev Authorize new verifier (only owner)
     */
    function authorizeVerifier(address verifier) public onlyOwner {
        require(!authorizedVerifiers[verifier], "Already authorized");
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }
    
    /**
     * @dev Revoke verifier authorization (only owner)
     */
    function revokeVerifier(address verifier) public onlyOwner {
        require(authorizedVerifiers[verifier], "Not authorized");
        require(verifier != owner(), "Cannot revoke owner");
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }
    
    /**
     * @dev Check if address is authorized verifier
     */
    function isAuthorizedVerifier(address verifier) public view returns (bool) {
        return authorizedVerifiers[verifier];
    }
    
    /**
     * @dev Update NFT token ID for content
     */
    function updateNFTTokenId(string memory contentHash, uint256 nftTokenId) public {
        require(contentExists[contentHash], "Content not found");
        require(contentRecords[contentHash].creator == msg.sender, "Not the creator");
        
        contentRecords[contentHash].nftTokenId = nftTokenId;
    }
    
    /**
     * @dev Search content by creator and type
     */
    function searchContent(
        address creator,
        ContentType contentType,
        bool verifiedOnly
    ) public view returns (string[] memory) {
        string[] memory creatorContents = creatorContent[creator];
        string[] memory results = new string[](creatorContents.length);
        uint256 count = 0;
        
        for (uint i = 0; i < creatorContents.length; i++) {
            ContentRecord memory record = contentRecords[creatorContents[i]];
            if (record.contentType == contentType && (!verifiedOnly || record.isVerified)) {
                results[count] = creatorContents[i];
                count++;
            }
        }
        
        // Resize array to actual count
        string[] memory finalResults = new string[](count);
        for (uint i = 0; i < count; i++) {
            finalResults[i] = results[i];
        }
        
        return finalResults;
    }
}
