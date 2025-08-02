pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMinting is ERC721, Ownable {
    uint256 public tokenIdCounter;

    constructor(address initialOwner) ERC721("MediaNFT", "MNFT") Ownable(initialOwner) {}

    function mintNFT(address to) public onlyOwner {
        _safeMint(to, tokenIdCounter);
        tokenIdCounter++;
    }
}
