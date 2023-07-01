require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
const fs = require('fs');


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 11155111
    },
    sepolia: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [ process.env.PRIVATE_KEY ]
    }
  },
  solidity: {
    version: "0.8.4",
    paths: {
      artifacts: './artifacts',
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};