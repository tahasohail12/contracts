const hre = require("hardhat");

async function main() {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy ContentAuthenticator first
    console.log("\n🔐 Deploying ContentAuthenticator...");
    const ContentAuthenticator = await hre.ethers.getContractFactory("ContentAuthenticator");
    const contentAuthenticator = await ContentAuthenticator.deploy(deployer.address);
    await contentAuthenticator.waitForDeployment();
    const contentAuthenticatorAddress = await contentAuthenticator.getAddress();
    console.log("✅ ContentAuthenticator deployed to:", contentAuthenticatorAddress);

    // Deploy MediaNFTMarketplace
    console.log("\n🎨 Deploying MediaNFTMarketplace...");
    const MediaNFTMarketplace = await hre.ethers.getContractFactory("MediaNFTMarketplace");
    const mediaNFTMarketplace = await MediaNFTMarketplace.deploy(deployer.address);
    await mediaNFTMarketplace.waitForDeployment();
    const mediaNFTMarketplaceAddress = await mediaNFTMarketplace.getAddress();
    console.log("✅ MediaNFTMarketplace deployed to:", mediaNFTMarketplaceAddress);

    // For AdvancedLicenseManager, we need a payment token address
    // Deploy a mock ERC20 token for testing (you can replace with real token later)
    console.log("\n💰 Deploying Mock Payment Token...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("MediaToken", "MTK", hre.ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("✅ Mock Payment Token deployed to:", mockTokenAddress);

    // Deploy AdvancedLicenseManager
    console.log("\n📄 Deploying AdvancedLicenseManager...");
    const AdvancedLicenseManager = await hre.ethers.getContractFactory("AdvancedLicenseManager");
    const advancedLicenseManager = await AdvancedLicenseManager.deploy(
        deployer.address,
        mockTokenAddress,
        deployer.address // Treasury wallet
    );
    await advancedLicenseManager.waitForDeployment();
    const advancedLicenseManagerAddress = await advancedLicenseManager.getAddress();
    console.log("✅ AdvancedLicenseManager deployed to:", advancedLicenseManagerAddress);

    // Deploy original contracts for backward compatibility
    console.log("\n📝 Deploying Original MediaRegistry...");
    const MediaRegistry = await hre.ethers.getContractFactory("MediaRegistry");
    const mediaRegistry = await MediaRegistry.deploy();
    await mediaRegistry.waitForDeployment();
    const mediaRegistryAddress = await mediaRegistry.getAddress();
    console.log("✅ MediaRegistry deployed to:", mediaRegistryAddress);

    console.log("\n🎭 Deploying Original NFTMinting...");
    const NFTMinting = await hre.ethers.getContractFactory("NFTMinting");
    const nftMinting = await NFTMinting.deploy(deployer.address);
    await nftMinting.waitForDeployment();
    const nftMintingAddress = await nftMinting.getAddress();
    console.log("✅ NFTMinting deployed to:", nftMintingAddress);

    console.log("\n⚖️ Deploying Original LicenseManager...");
    const LicenseManager = await hre.ethers.getContractFactory("LicenseManager");
    const licenseManager = await LicenseManager.deploy();
    await licenseManager.waitForDeployment();
    const licenseManagerAddress = await licenseManager.getAddress();
    console.log("✅ LicenseManager deployed to:", licenseManagerAddress);

    // Display deployment summary
    console.log("\n" + "=".repeat(70));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📋 CONTRACT ADDRESSES:");
    console.log("├── 🔐 ContentAuthenticator:", contentAuthenticatorAddress);
    console.log("├── 🎨 MediaNFTMarketplace:", mediaNFTMarketplaceAddress);
    console.log("├── 📄 AdvancedLicenseManager:", advancedLicenseManagerAddress);
    console.log("├── 💰 Mock Payment Token:", mockTokenAddress);
    console.log("├── 📝 MediaRegistry (legacy):", mediaRegistryAddress);
    console.log("├── 🎭 NFTMinting (legacy):", nftMintingAddress);
    console.log("└── ⚖️ LicenseManager (legacy):", licenseManagerAddress);

    console.log("\n🌟 ENHANCED FEATURES:");
    console.log("✅ Advanced NFT marketplace with buy/sell/rent functionality");
    console.log("✅ Comprehensive licensing system with multiple license types");
    console.log("✅ Content authentication and verification system");
    console.log("✅ Royalty distribution for creators");
    console.log("✅ Time-based rental system");
    console.log("✅ ERC-2981 royalty standard support");
    console.log("✅ Multi-payment method support (ETH + tokens)");
    console.log("✅ Usage reporting and license management");

    // Create configuration file for backend integration
    const config = {
        contracts: {
            ContentAuthenticator: contentAuthenticatorAddress,
            MediaNFTMarketplace: mediaNFTMarketplaceAddress,
            AdvancedLicenseManager: advancedLicenseManagerAddress,
            MockPaymentToken: mockTokenAddress,
            // Legacy contracts
            MediaRegistry: mediaRegistryAddress,
            NFTMinting: nftMintingAddress,
            LicenseManager: licenseManagerAddress
        },
        network: {
            name: hre.network.name,
            chainId: hre.network.config.chainId
        },
        deployer: deployer.address,
        deploymentTime: new Date().toISOString()
    };

    // Save configuration
    const fs = require('fs');
    fs.writeFileSync(
        './deployment-config.json',
        JSON.stringify(config, null, 2)
    );
    console.log("\n💾 Configuration saved to deployment-config.json");

    console.log("\n🚀 Ready for integration with backend and frontend!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
