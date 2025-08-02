pragma solidity ^0.8.20;

contract LicenseManager {
    mapping(uint256 => address) public licenseOwners;

    function buyLicense(uint256 _mediaId) public payable {
        require(licenseOwners[_mediaId] == address(0), "License already owned");
        licenseOwners[_mediaId] = msg.sender;
    }

    function transferLicense(uint256 _mediaId, address _to) public {
        require(licenseOwners[_mediaId] == msg.sender, "Not the license owner");
        licenseOwners[_mediaId] = _to;
    }
}
