pragma solidity ^0.8.20;

contract MediaRegistry {
    struct Media {
        string hash;
        string metadata;
    }

    mapping(uint256 => Media) public mediaRegistry;
    uint256 public mediaCount;

    function registerMedia(string memory _hash, string memory _metadata) public {
        mediaRegistry[mediaCount] = Media(_hash, _metadata);
        mediaCount++;
    }
}
