const Web3 = require('web3');
const nUSDABI = require('./nUSD_ABI.json'); // Assuming the nUSDABI is stored in a separate file


window.addEventListener("load", async () => {
    if (typeof web3 !== "undefined") {
      web3 = new Web3(web3.currentProvider);
    } else {
      console.log("No web3 provider found. Please install Metamask.");
      return;
    }

    


  
    const nUSDAddress = "0x691b8d4a5c3EABA4794760829DcAc33B5461718C";
    const nUSDContract = new web3.eth.Contract(nUSDABI, nUSDAddress);
    
    const depositButton = document.getElementById("depositButton");
    const redeemButton = document.getElementById("redeemButton");
    const totalSupplyInput = document.getElementById("totalSupply");
    const depositAmountInput = document.getElementById("depositAmount");
    const redeemAmountInput = document.getElementById("redeemAmount");
    const resultDiv = document.getElementById("result");
  
    // Get the total nUSD supply
    async function getTotalSupply() {
      const supply = await nUSDContract.methods.totalSupply().call();
      totalSupplyInput.value = supply;
    }
  
    // Deposit ETH
    async function depositETH() {
      const amount = depositAmountInput.value;
      if (!amount) {
        resultDiv.innerHTML = "Please enter a valid deposit amount.";
        return;
      }
  
      try {
        const tx = await nUSDContract.methods.deposit().send({
          from: web3.eth.defaultAccount,
          value: web3.utils.toWei(amount),
        });
        resultDiv.innerHTML = `Deposit successful. Transaction hash: ${tx.transactionHash}`;
        getTotalSupply();
      } catch (error) {
        resultDiv.innerHTML = `Deposit failed: ${error.message}`;
      }
    }
  
    // Redeem nUSD
    async function redeemnUSD() {
      const amount = redeemAmountInput.value;
      if (!amount) {
        resultDiv.innerHTML = "Please enter a valid nUSD amount.";
        return;
      }
  
      try {
        const tx = await nUSDContract.methods.redeem(web3.utils.toWei(amount)).send({
          from: web3.eth.defaultAccount,
        });
        resultDiv.innerHTML = `Redeem successful. Transaction hash: ${tx.transactionHash}`;
        getTotalSupply();
      } catch (error) {
        resultDiv.innerHTML = `Redeem failed: ${error.message}`;
      }
    }
  
    // Set the default account and load the total nUSD supply
    async function init() {
      const accounts = await web3.eth.requestAccounts();
      web3.eth.defaultAccount = accounts[0];
      getTotalSupply();
    }
  
    depositButton.addEventListener("click", depositETH);
    redeemButton.addEventListener("click", redeemnUSD);
  
    init();
  });
  