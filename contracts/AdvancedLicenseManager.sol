// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AdvancedLicenseManager
 * @dev Advanced licensing system for digital content with multiple license types and payment options
 */
contract AdvancedLicenseManager is Ownable, ReentrancyGuard {
    
    struct LicenseTemplate {
        string name;
        string description;
        uint256 basePriceETH;
        uint256 basePriceToken;
        uint256 maxDuration;
        bool isActive;
        LicenseScope scope;
        CommercialRights commercialRights;
    }
    
    struct License {
        uint256 licenseId;
        uint256 templateId;
        uint256 contentTokenId;
        address licensee;
        address licensor;
        uint256 startTime;
        uint256 endTime;
        uint256 pricePaid;
        PaymentMethod paymentMethod;
        LicenseStatus status;
        string termsHash; // IPFS hash of detailed terms
    }
    
    struct UsageReport {
        uint256 licenseId;
        string usageDescription;
        uint256 timestamp;
        string proofHash; // IPFS hash of usage proof
    }
    
    enum LicenseScope {
        PERSONAL,
        COMMERCIAL_LIMITED,
        COMMERCIAL_EXTENDED,
        EXCLUSIVE,
        EDUCATIONAL,
        NON_PROFIT
    }
    
    enum CommercialRights {
        NONE,
        ATTRIBUTION_REQUIRED,
        ROYALTY_FREE,
        REVENUE_SHARE
    }
    
    enum PaymentMethod {
        ETH,
        TOKEN
    }
    
    enum LicenseStatus {
        ACTIVE,
        EXPIRED,
        REVOKED,
        SUSPENDED
    }
    
    // State variables
    mapping(uint256 => LicenseTemplate) public licenseTemplates;
    mapping(uint256 => License) public licenses;
    mapping(uint256 => UsageReport[]) public usageReports;
    mapping(address => uint256[]) public userLicenses;
    mapping(uint256 => uint256[]) public contentLicenses; // contentTokenId => licenseIds
    
    uint256 public templateCounter;
    uint256 public licenseCounter;
    
    IERC20 public paymentToken;
    address public treasuryWallet;
    uint256 public platformFeePercentage = 250; // 2.5%
    
    // Events
    event LicenseTemplateCreated(uint256 indexed templateId, string name);
    event LicenseGranted(uint256 indexed licenseId, address indexed licensee, uint256 contentTokenId);
    event LicenseRevoked(uint256 indexed licenseId, string reason);
    event UsageReported(uint256 indexed licenseId, string usageDescription);
    event RoyaltyPaid(uint256 indexed licenseId, address indexed creator, uint256 amount);
    
    constructor(address initialOwner, address _paymentToken, address _treasuryWallet) 
        Ownable(initialOwner) 
    {
        paymentToken = IERC20(_paymentToken);
        treasuryWallet = _treasuryWallet;
        
        // Create default license templates
        _createDefaultTemplates();
    }
    
    /**
     * @dev Create a new license template
     */
    function createLicenseTemplate(
        string memory name,
        string memory description,
        uint256 basePriceETH,
        uint256 basePriceToken,
        uint256 maxDuration,
        LicenseScope scope,
        CommercialRights commercialRights
    ) public onlyOwner returns (uint256) {
        uint256 templateId = templateCounter++;
        
        licenseTemplates[templateId] = LicenseTemplate({
            name: name,
            description: description,
            basePriceETH: basePriceETH,
            basePriceToken: basePriceToken,
            maxDuration: maxDuration,
            isActive: true,
            scope: scope,
            commercialRights: commercialRights
        });
        
        emit LicenseTemplateCreated(templateId, name);
        return templateId;
    }
    
    /**
     * @dev Purchase a license with ETH
     */
    function purchaseLicenseETH(
        uint256 templateId,
        uint256 contentTokenId,
        uint256 duration,
        string memory termsHash
    ) public payable nonReentrant returns (uint256) {
        LicenseTemplate memory template = licenseTemplates[templateId];
        require(template.isActive, "Template not active");
        require(duration <= template.maxDuration, "Duration exceeds maximum");
        
        uint256 totalPrice = _calculatePrice(template.basePriceETH, duration);
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 licenseId = _createLicense(
            templateId,
            contentTokenId,
            msg.sender,
            duration,
            totalPrice,
            PaymentMethod.ETH,
            termsHash
        );
        
        // Handle payment distribution
        _distributePaymentETH(totalPrice, contentTokenId);
        
        // Refund excess
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        return licenseId;
    }
    
    /**
     * @dev Purchase a license with tokens
     */
    function purchaseLicenseToken(
        uint256 templateId,
        uint256 contentTokenId,
        uint256 duration,
        string memory termsHash
    ) public nonReentrant returns (uint256) {
        LicenseTemplate memory template = licenseTemplates[templateId];
        require(template.isActive, "Template not active");
        require(duration <= template.maxDuration, "Duration exceeds maximum");
        
        uint256 totalPrice = _calculatePrice(template.basePriceToken, duration);
        require(paymentToken.transferFrom(msg.sender, address(this), totalPrice), "Token transfer failed");
        
        uint256 licenseId = _createLicense(
            templateId,
            contentTokenId,
            msg.sender,
            duration,
            totalPrice,
            PaymentMethod.TOKEN,
            termsHash
        );
        
        // Handle payment distribution
        _distributePaymentToken(totalPrice, contentTokenId);
        
        return licenseId;
    }
    
    /**
     * @dev Extend existing license
     */
    function extendLicense(uint256 licenseId, uint256 additionalDuration) public payable {
        License storage license = licenses[licenseId];
        require(license.licensee == msg.sender, "Not the licensee");
        require(license.status == LicenseStatus.ACTIVE, "License not active");
        require(block.timestamp < license.endTime, "License already expired");
        
        LicenseTemplate memory template = licenseTemplates[license.templateId];
        uint256 newEndTime = license.endTime + additionalDuration;
        require(newEndTime - license.startTime <= template.maxDuration, "Total duration exceeds maximum");
        
        uint256 extensionPrice;
        if (license.paymentMethod == PaymentMethod.ETH) {
            extensionPrice = _calculatePrice(template.basePriceETH, additionalDuration);
            require(msg.value >= extensionPrice, "Insufficient payment");
            _distributePaymentETH(extensionPrice, license.contentTokenId);
            
            if (msg.value > extensionPrice) {
                payable(msg.sender).transfer(msg.value - extensionPrice);
            }
        } else {
            extensionPrice = _calculatePrice(template.basePriceToken, additionalDuration);
            require(paymentToken.transferFrom(msg.sender, address(this), extensionPrice), "Token transfer failed");
            _distributePaymentToken(extensionPrice, license.contentTokenId);
        }
        
        license.endTime = newEndTime;
        license.pricePaid += extensionPrice;
    }
    
    /**
     * @dev Report usage of licensed content
     */
    function reportUsage(
        uint256 licenseId,
        string memory usageDescription,
        string memory proofHash
    ) public {
        License memory license = licenses[licenseId];
        require(license.licensee == msg.sender, "Not the licensee");
        require(license.status == LicenseStatus.ACTIVE, "License not active");
        require(block.timestamp >= license.startTime && block.timestamp <= license.endTime, "License not in valid period");
        
        usageReports[licenseId].push(UsageReport({
            licenseId: licenseId,
            usageDescription: usageDescription,
            timestamp: block.timestamp,
            proofHash: proofHash
        }));
        
        emit UsageReported(licenseId, usageDescription);
    }
    
    /**
     * @dev Revoke a license (only by licensor or admin)
     */
    function revokeLicense(uint256 licenseId, string memory reason) public {
        License storage license = licenses[licenseId];
        require(license.licensor == msg.sender || msg.sender == owner(), "Not authorized");
        require(license.status == LicenseStatus.ACTIVE, "License not active");
        
        license.status = LicenseStatus.REVOKED;
        
        emit LicenseRevoked(licenseId, reason);
    }
    
    /**
     * @dev Check if license is valid and active
     */
    function isLicenseValid(uint256 licenseId) public view returns (bool) {
        License memory license = licenses[licenseId];
        return license.status == LicenseStatus.ACTIVE && 
               block.timestamp >= license.startTime && 
               block.timestamp <= license.endTime;
    }
    
    /**
     * @dev Get user's licenses
     */
    function getUserLicenses(address user) public view returns (uint256[] memory) {
        return userLicenses[user];
    }
    
    /**
     * @dev Get content licenses
     */
    function getContentLicenses(uint256 contentTokenId) public view returns (uint256[] memory) {
        return contentLicenses[contentTokenId];
    }
    
    /**
     * @dev Get usage reports for a license
     */
    function getLicenseUsageReports(uint256 licenseId) public view returns (UsageReport[] memory) {
        return usageReports[licenseId];
    }
    
    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Update treasury wallet
     */
    function updateTreasuryWallet(address newTreasury) public onlyOwner {
        treasuryWallet = newTreasury;
    }
    
    // Internal functions
    function _createLicense(
        uint256 templateId,
        uint256 contentTokenId,
        address licensee,
        uint256 duration,
        uint256 price,
        PaymentMethod paymentMethod,
        string memory termsHash
    ) internal returns (uint256) {
        uint256 licenseId = licenseCounter++;
        
        licenses[licenseId] = License({
            licenseId: licenseId,
            templateId: templateId,
            contentTokenId: contentTokenId,
            licensee: licensee,
            licensor: msg.sender, // This should be set by the NFT contract
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            pricePaid: price,
            paymentMethod: paymentMethod,
            status: LicenseStatus.ACTIVE,
            termsHash: termsHash
        });
        
        userLicenses[licensee].push(licenseId);
        contentLicenses[contentTokenId].push(licenseId);
        
        emit LicenseGranted(licenseId, licensee, contentTokenId);
        return licenseId;
    }
    
    function _calculatePrice(uint256 basePrice, uint256 duration) internal pure returns (uint256) {
        // Simple linear pricing based on duration (in days)
        uint256 durationInDays = duration / 86400;
        if (durationInDays == 0) durationInDays = 1; // Minimum 1 day
        return basePrice * durationInDays;
    }
    
    function _distributePaymentETH(uint256 totalAmount, uint256 contentTokenId) internal {
        uint256 platformFee = (totalAmount * platformFeePercentage) / 10000;
        uint256 creatorAmount = totalAmount - platformFee;
        
        // Send platform fee to treasury
        if (platformFee > 0) {
            payable(treasuryWallet).transfer(platformFee);
        }
        
        // Send remaining amount to content creator (this would need integration with NFT contract)
        // For now, keeping it in contract for creator to claim
    }
    
    function _distributePaymentToken(uint256 totalAmount, uint256 contentTokenId) internal {
        uint256 platformFee = (totalAmount * platformFeePercentage) / 10000;
        uint256 creatorAmount = totalAmount - platformFee;
        
        // Send platform fee to treasury
        if (platformFee > 0) {
            paymentToken.transfer(treasuryWallet, platformFee);
        }
        
        // Send remaining amount to content creator (this would need integration with NFT contract)
        // For now, keeping it in contract for creator to claim
    }
    
    function _createDefaultTemplates() internal {
        // Personal Use License
        createLicenseTemplate(
            "Personal Use",
            "License for personal, non-commercial use",
            0.01 ether,
            100 * 10**18, // 100 tokens
            365 days,
            LicenseScope.PERSONAL,
            CommercialRights.NONE
        );
        
        // Commercial License
        createLicenseTemplate(
            "Commercial License",
            "License for commercial use with attribution",
            0.1 ether,
            1000 * 10**18, // 1000 tokens
            365 days,
            LicenseScope.COMMERCIAL_LIMITED,
            CommercialRights.ATTRIBUTION_REQUIRED
        );
        
        // Extended Commercial License
        createLicenseTemplate(
            "Extended Commercial",
            "License for extended commercial use, royalty-free",
            0.5 ether,
            5000 * 10**18, // 5000 tokens
            365 days,
            LicenseScope.COMMERCIAL_EXTENDED,
            CommercialRights.ROYALTY_FREE
        );
    }
}
