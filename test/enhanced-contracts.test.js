const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Enhanced NFT Content Authentication Platform", function () {
    let mediaMarketplace, contentAuthenticator, licenseManager, mockToken;
    let owner, creator, buyer, licensee, verifier;

    beforeEach(async function () {
        [owner, creator, buyer, licensee, verifier] = await ethers.getSigners();

        // Deploy MockERC20
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockToken = await MockERC20.deploy("MediaToken", "MTK", ethers.parseEther("1000000"));

        // Deploy ContentAuthenticator
        const ContentAuthenticator = await ethers.getContractFactory("ContentAuthenticator");
        contentAuthenticator = await ContentAuthenticator.deploy(owner.address);

        // Deploy MediaNFTMarketplace
        const MediaNFTMarketplace = await ethers.getContractFactory("MediaNFTMarketplace");
        mediaMarketplace = await MediaNFTMarketplace.deploy(owner.address);

        // Deploy AdvancedLicenseManager
        const AdvancedLicenseManager = await ethers.getContractFactory("AdvancedLicenseManager");
        licenseManager = await AdvancedLicenseManager.deploy(
            owner.address,
            await mockToken.getAddress(),
            owner.address
        );

        // Authorize verifier
        await contentAuthenticator.authorizeVerifier(verifier.address);

        // Give tokens to users for testing
        await mockToken.transfer(buyer.address, ethers.parseEther("10000"));
        await mockToken.transfer(licensee.address, ethers.parseEther("10000"));
    });

    describe("ContentAuthenticator", function () {
        it("Should register content successfully", async function () {
            const contentHash = "QmTest123";
            const ipfsHash = "QmIPFS123";
            const metadata = "Test metadata";

            // Create signature for content registration
            const messageHash = ethers.solidityPackedKeccak256(
                ["string", "address"],
                [contentHash, creator.address]
            );
            const signature = await creator.signMessage(ethers.getBytes(messageHash));

            await expect(
                contentAuthenticator.connect(creator).registerContent(
                    contentHash,
                    ipfsHash,
                    metadata,
                    0, // ContentType.IMAGE
                    0, // nftTokenId
                    signature
                )
            ).to.emit(contentAuthenticator, "ContentRegistered");

            const [exists, registeredCreator] = await contentAuthenticator.verifyContent(contentHash);
            expect(exists).to.be.true;
            expect(registeredCreator).to.equal(creator.address);
        });

        it("Should not allow duplicate content registration", async function () {
            const contentHash = "QmTest123";
            const messageHash = ethers.solidityPackedKeccak256(
                ["string", "address"],
                [contentHash, creator.address]
            );
            const signature = await creator.signMessage(ethers.getBytes(messageHash));

            await contentAuthenticator.connect(creator).registerContent(
                contentHash, "QmIPFS123", "metadata", 0, 0, signature
            );

            await expect(
                contentAuthenticator.connect(creator).registerContent(
                    contentHash, "QmIPFS123", "metadata", 0, 0, signature
                )
            ).to.be.revertedWith("Content already registered");
        });
    });

    describe("MediaNFTMarketplace", function () {
        it("Should mint NFT successfully", async function () {
            const contentHash = "QmTest123";
            const ipfsHash = "QmIPFS123";
            const metadata = "Test metadata";
            const tokenURI = "https://example.com/token/1";

            await expect(
                mediaMarketplace.connect(creator).mintContentNFT(
                    creator.address,
                    contentHash,
                    ipfsHash,
                    metadata,
                    tokenURI,
                    500 // 5% royalty
                )
            ).to.emit(mediaMarketplace, "MediaMinted");

            expect(await mediaMarketplace.ownerOf(0)).to.equal(creator.address);
            
            const asset = await mediaMarketplace.getMediaAsset(0);
            expect(asset.contentHash).to.equal(contentHash);
            expect(asset.creator).to.equal(creator.address);
        });

        it("Should handle NFT sale correctly", async function () {
            // Mint NFT
            await mediaMarketplace.connect(creator).mintContentNFT(
                creator.address,
                "QmTest123",
                "QmIPFS123",
                "metadata",
                "tokenURI",
                500
            );

            // List for sale
            const price = ethers.parseEther("1");
            await mediaMarketplace.connect(creator).listForSale(0, price);

            const asset = await mediaMarketplace.getMediaAsset(0);
            expect(asset.isForSale).to.be.true;
            expect(asset.price).to.equal(price);

            // Buy NFT
            await expect(
                mediaMarketplace.connect(buyer).buyNFT(0, { value: price })
            ).to.emit(mediaMarketplace, "MediaSold");

            expect(await mediaMarketplace.ownerOf(0)).to.equal(buyer.address);
        });

        it("Should handle royalty payments correctly", async function () {
            // Mint NFT
            await mediaMarketplace.connect(creator).mintContentNFT(
                creator.address,
                "QmTest123",
                "QmIPFS123",
                "metadata",
                "tokenURI",
                500 // 5% royalty
            );

            // Transfer to someone else first
            await mediaMarketplace.connect(creator).transferFrom(creator.address, buyer.address, 0);

            // List for sale by new owner
            const price = ethers.parseEther("1");
            await mediaMarketplace.connect(buyer).listForSale(0, price);

            const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

            // Buy NFT (should pay royalty to creator)
            await mediaMarketplace.connect(licensee).buyNFT(0, { value: price });

            const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
            const expectedRoyalty = price * 500n / 10000n; // 5%
            
            expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(expectedRoyalty);
        });
    });

    describe("AdvancedLicenseManager", function () {
        beforeEach(async function () {
            // Approve license manager to spend tokens
            await mockToken.connect(licensee).approve(
                await licenseManager.getAddress(),
                ethers.parseEther("1000")
            );
        });

        it("Should create license templates correctly", async function () {
            const template = await licenseManager.licenseTemplates(0);
            expect(template.name).to.equal("Personal Use");
            expect(template.isActive).to.be.true;
        });

        it("Should purchase license with ETH", async function () {
            const templateId = 0;
            const contentTokenId = 1;
            const duration = 86400; // 1 day
            const termsHash = "QmTerms123";

            const template = await licenseManager.licenseTemplates(templateId);
            const price = template.basePriceETH;

            await expect(
                licenseManager.connect(licensee).purchaseLicenseETH(
                    templateId,
                    contentTokenId,
                    duration,
                    termsHash,
                    { value: price }
                )
            ).to.emit(licenseManager, "LicenseGranted");

            const license = await licenseManager.licenses(0);
            expect(license.licensee).to.equal(licensee.address);
            expect(license.contentTokenId).to.equal(contentTokenId);
        });

        it("Should purchase license with tokens", async function () {
            const templateId = 1;
            const contentTokenId = 1;
            const duration = 86400; // 1 day
            const termsHash = "QmTerms123";

            await expect(
                licenseManager.connect(licensee).purchaseLicenseToken(
                    templateId,
                    contentTokenId,
                    duration,
                    termsHash
                )
            ).to.emit(licenseManager, "LicenseGranted");

            const license = await licenseManager.licenses(0);
            expect(license.licensee).to.equal(licensee.address);
        });

        it("Should validate license correctly", async function () {
            const templateId = 0;
            const contentTokenId = 1;
            const duration = 86400;
            const termsHash = "QmTerms123";

            const template = await licenseManager.licenseTemplates(templateId);
            const price = template.basePriceETH;

            await licenseManager.connect(licensee).purchaseLicenseETH(
                templateId,
                contentTokenId,
                duration,
                termsHash,
                { value: price }
            );

            const isValid = await licenseManager.isLicenseValid(0);
            expect(isValid).to.be.true;
        });
    });

    describe("Integration Tests", function () {
        it("Should complete full content lifecycle", async function () {
            const contentHash = "QmFullTest123";
            const ipfsHash = "QmIPFSFull123";
            const metadata = "Full test metadata";

            // 1. Register content
            const messageHash = ethers.solidityPackedKeccak256(
                ["string", "address"],
                [contentHash, creator.address]
            );
            const signature = await creator.signMessage(ethers.getBytes(messageHash));

            await contentAuthenticator.connect(creator).registerContent(
                contentHash, ipfsHash, metadata, 0, 0, signature
            );

            // 2. Mint NFT
            await mediaMarketplace.connect(creator).mintContentNFT(
                creator.address,
                contentHash,
                ipfsHash,
                metadata,
                "tokenURI",
                500
            );

            // 3. Request and complete verification
            await contentAuthenticator.connect(creator).requestVerification(
                contentHash,
                "Request verification for test content"
            );
            
            await contentAuthenticator.connect(verifier).completeVerification(
                0, // First verification request
                1, // VerificationStatus.VERIFIED
                "Verified by authorized verifier"
            );

            // 4. List for sale
            const price = ethers.parseEther("1");
            await mediaMarketplace.connect(creator).listForSale(0, price);

            // 5. Purchase license
            await mockToken.connect(licensee).approve(
                await licenseManager.getAddress(),
                ethers.parseEther("1000")
            );

            await licenseManager.connect(licensee).purchaseLicenseToken(
                0, // templateId
                0, // contentTokenId (NFT token ID)
                86400, // 1 day
                "QmLicenseTerms"
            );

            // Verify final state
            const [exists, , , isVerified] = await contentAuthenticator.verifyContent(contentHash);
            expect(exists).to.be.true;
            expect(isVerified).to.be.true;

            const asset = await mediaMarketplace.getMediaAsset(0);
            expect(asset.isForSale).to.be.true;

            const isLicenseValid = await licenseManager.isLicenseValid(0);
            expect(isLicenseValid).to.be.true;
        });
    });
});
