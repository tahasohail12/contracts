const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMinting", function () {
    let nftMinting;
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const NFTMinting = await ethers.getContractFactory("NFTMinting");
        nftMinting = await NFTMinting.deploy(owner.address);
        await nftMinting.waitForDeployment();
    });

    it("Should mint NFT to specified address", async function () {
        await nftMinting.mintNFT(addr1.address);
        expect(await nftMinting.ownerOf(0)).to.equal(addr1.address);
        expect(await nftMinting.tokenIdCounter()).to.equal(1n);
    });

    it("Should only allow owner to mint", async function () {
        await expect(
            nftMinting.connect(addr1).mintNFT(addr1.address)
        ).to.be.revertedWithCustomError(nftMinting, "OwnableUnauthorizedAccount");
    });
});
