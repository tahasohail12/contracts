const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LicenseManager", function () {
    let licenseManager;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const LicenseManager = await ethers.getContractFactory("LicenseManager");
        licenseManager = await LicenseManager.deploy();
        await licenseManager.waitForDeployment();
    });

    it("Should buy license for media", async function () {
        const mediaId = 1;
        await licenseManager.connect(addr1).buyLicense(mediaId, { value: ethers.parseEther("0.1") });
        expect(await licenseManager.licenseOwners(mediaId)).to.equal(addr1.address);
    });

    it("Should not allow buying license for already owned media", async function () {
        const mediaId = 1;
        await licenseManager.connect(addr1).buyLicense(mediaId, { value: ethers.parseEther("0.1") });
        
        await expect(
            licenseManager.connect(addr2).buyLicense(mediaId, { value: ethers.parseEther("0.1") })
        ).to.be.revertedWith("License already owned");
    });

    it("Should transfer license", async function () {
        const mediaId = 1;
        await licenseManager.connect(addr1).buyLicense(mediaId, { value: ethers.parseEther("0.1") });
        await licenseManager.connect(addr1).transferLicense(mediaId, addr2.address);
        expect(await licenseManager.licenseOwners(mediaId)).to.equal(addr2.address);
    });

    it("Should not allow non-owner to transfer license", async function () {
        const mediaId = 1;
        await licenseManager.connect(addr1).buyLicense(mediaId, { value: ethers.parseEther("0.1") });
        
        await expect(
            licenseManager.connect(addr2).transferLicense(mediaId, addr2.address)
        ).to.be.revertedWith("Not the license owner");
    });
});
