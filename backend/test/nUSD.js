const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("nUSD", function () {
  let nUSDContract;
  let owner;
  let account1;

  beforeEach(async function () {
    [owner, account1] = await ethers.getSigners();
    const nUSDFactory = await ethers.getContractFactory("nUSD");
    nUSDContract = await nUSDFactory.deploy();
    await nUSDContract.deployed();
  });

  it("should set the owner and priceFeed variables correctly in the constructor", async function () {
    expect(await nUSDContract.owner()).to.equal(await owner.getAddress());
  
    const expectedPriceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    expect(await nUSDContract.priceFeed()).to.equal(expectedPriceFeedAddress);
  });
  

  it("should deposit ETH and mint nUSD", async function () {
    const ethAmount = ethers.utils.parseEther("1");

   const nUsdAmount = await nUSDContract.connect(account1).deposit({ value: ethAmount });

    expect(await nUSDContract.balanceOf(await account1.getAddress())).to.equal(nUsdAmount);
    expect(await nUSDContract.totalSupply()).to.equal(nUsdAmount);
  });

  it("should redeem nUSD and send ETH", async function () {
    const ethAmount = ethers.utils.parseEther("1");
    const nUSDAmount = ethers.utils.parseUnits("500", 18);

    await nUSDContract.connect(account1).deposit({ value: ethAmount });
    await nUSDContract.connect(account1).redeem(nUSDAmount);

    expect(await nUSDContract.balanceOf(await account1.getAddress())).to.equal(ethAmount.sub(nUSDAmount));
    expect(await nUSDContract.totalSupply()).to.equal(ethAmount.sub(nUSDAmount));
    expect(await ethers.provider.getBalance(await account1.getAddress())).to.be.above(ethAmount);
  });

  it("should transfer nUSD from one account to another", async function () {
    const ethAmount = ethers.utils.parseEther("1");
    const transferAmount = ethers.utils.parseUnits("500", 18);

    await nUSDContract.connect(account1).deposit({ value: ethAmount });
    await nUSDContract.connect(account1).transfer(await account2.getAddress(), transferAmount);

    expect(await nUSDContract.balanceOf(await account1.getAddress())).to.equal(
      ethAmount.sub(transferAmount)
    );
    expect(await nUSDContract.balanceOf(await account2.getAddress())).to.equal(transferAmount);
  });
});
