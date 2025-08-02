require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
    },
    networks: {
        sepolia: {
            url: "https://sepolia.infura.io/v3/f30bff13a25c46cb8ab16fc33df75aa4",
            accounts: ["f794863ff16cba3b7d8bc489c5e599547ddd016602ce4db535d961b6ea4282cb"],
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};
