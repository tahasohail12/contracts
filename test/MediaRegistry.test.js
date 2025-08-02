const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MediaRegistry", function () {
    it("Should register media", async function () {
        const MediaRegistry = await ethers.getContractFactory("MediaRegistry");
        const mediaRegistry = await MediaRegistry.deploy();
        await mediaRegistry.waitForDeployment();

        await mediaRegistry.registerMedia("hash123", "metadata123");
        const media = await mediaRegistry.mediaRegistry(0);
        expect(media.hash).to.equal("hash123");
        expect(media.metadata).to.equal("metadata123");
    });
});
