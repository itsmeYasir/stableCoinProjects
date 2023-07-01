const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const nUSD = await hre.ethers.getContractFactory("nUSD");
  const nUSDContract = await nUSD.deploy();

  await nUSDContract.deployed();

  console.log("nUSD deployed to:", nUSDContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
