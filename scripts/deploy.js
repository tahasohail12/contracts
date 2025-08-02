const hre = require("hardhat");

async function main() {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy MediaRegistry
    const MediaRegistry = await hre.ethers.getContractFactory("MediaRegistry");
    const mediaRegistry = await MediaRegistry.deploy();
    await mediaRegistry.waitForDeployment();
    console.log("MediaRegistry deployed to:", await mediaRegistry.getAddress());

    // Deploy NFTMinting
    const NFTMinting = await hre.ethers.getContractFactory("NFTMinting");
    const nftMinting = await NFTMinting.deploy(deployer.address);
    await nftMinting.waitForDeployment();
    console.log("NFTMinting deployed to:", await nftMinting.getAddress());

    // Deploy LicenseManager
    const LicenseManager = await hre.ethers.getContractFactory("LicenseManager");
    const licenseManager = await LicenseManager.deploy();
    await licenseManager.waitForDeployment();
    console.log("LicenseManager deployed to:", await licenseManager.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
