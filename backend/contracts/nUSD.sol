
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract nUSD is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    string public constant name = "nUsd";
    string public constant symbol = "nUSD";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    uint256 public constant peggedValue = 2; // Value of 1 nUSD in ETH (e.g., 2000 / 1000 = 2)
    address public owner;
    
    AggregatorV3Interface public priceFeed;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
         priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }
    
    function getEthPriceInUsd() public view returns(uint256){
    (, int256 price, , ,) = priceFeed.latestRoundData();
    uint256 ethPrice = uint256(price);
    // Convert to 18 decimal places
    ethPrice = ethPrice * (10**10);
    return ethPrice;
  
    }
    
    function deposit() external payable nonReentrant returns  (uint256 nUsdAmount){
        require(msg.value != 0, "Invalid amount"); // Ensure non-zero deposit
        
        nUsdAmount = msg.value.mul(getEthPriceInUsd()).div(10**decimals).div(peggedValue);
        // Calculate nUSD amount
        
        balanceOf[msg.sender] += nUsdAmount; // Mint nUSD to user
        totalSupply += nUsdAmount; // Increase total supply
        
        emit Transfer(address(0), msg.sender, nUsdAmount); // Emit Transfer event
    }
    
    function redeem(uint256 _nUsdAmount) external nonReentrant returns (uint256 ethAmount){
        require(balanceOf[msg.sender] >= _nUsdAmount, "Insufficient balance"); // Ensure user has sufficient nUSD
        
        // uint256 ethAmount = _nUsdAmount * peggedValue/getEthPriceInUsd(); // Calculate ETH amount (nUSD * peggedValue * 2)
        
        ethAmount = _nUsdAmount.mul(10**decimals).mul(peggedValue).div(getEthPriceInUsd());

    require(ethAmount <= address(this).balance, "Insufficient contract eth balance");

        balanceOf[msg.sender] -= _nUsdAmount; // Reduce nUSD balance
        totalSupply -= _nUsdAmount; // Decrease total supply
        
        payable(msg.sender).transfer(ethAmount); // Transfer ETH to user
        
        emit Transfer(msg.sender, address(0), _nUsdAmount); // Emit Transfer event
    }
    
    function transfer(address _to, uint256 _amount) external returns (bool success) {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool success) {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _amount, "Allowance exceeded");
        
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;
        
        emit Transfer(_from, _to, _amount);
        return true;
    }
    
    function approve(address _spender, uint256 _amount) external returns (bool success) {
        allowance[msg.sender][_spender] = _amount;
        
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }


    function withdrawETH(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(_amount);
    }

    function withdrawToken(address _token, uint256 _amount) external onlyOwner {
        IERC20 token = IERC20(_token);
        require(_amount > 0, "Invalid amount");
        require(_amount <= token.balanceOf(address(this)), "Insufficient token balance");
        token.safeTransfer(owner, _amount);
    }
}
