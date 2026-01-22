// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address a) external view returns (uint256);
}

contract FuturoVault {
    IERC20 public usdc;
    address public owner;

    mapping(address => uint256) public balances;
    mapping(address => bool) public isMarket;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event MarketWhitelisted(address indexed market, bool allowed);
    event SpentFrom(address indexed user, address indexed market, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyMarket() {
        require(isMarket[msg.sender], "not market");
        _;
    }

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount = 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        require(usdc.transfer(msg.sender, amount), "transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function setMarket(address market, bool allowed) external onlyOwner {
        isMarket[market] = allowed;
        emit MarketWhitelisted(market, allowed);
    }

    function spendFrom(address user, uint256 amount) external onlyMarket {
        require(balances[user] >= amount, "insufficient");
        balances[user] -= amount;
        require(usdc.transfer(msg.sender, amount), "transfer failed");
        emit SpentFrom(user, msg.sender, amount);
    }
}
