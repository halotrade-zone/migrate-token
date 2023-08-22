// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract MigrateToken is Ownable {
    // The address of the source token
    address public sourceToken;

    // The address of the target token
    address public targetToken;

    // event convert tokens from the source token to the target token
    event Convert(address user, uint amount, uint when);

    // event contract owner deposit target tokens
    event Deposit(uint amount, uint when);

    // event contract owner withdraw all tokens
    event Withdraw(address tokenAddress, uint amount, uint when);

    // The constructor function, which sets the addresses of the tokens
    constructor(address _sourceToken, address _targetToken) {
        // the address of the tokens should be valid
        require(_sourceToken != address(0) && _targetToken != address(0), "Invalid token address");

        sourceToken = _sourceToken;
        targetToken = _targetToken;
    }

    // ADMIN FUNCTIONS (onlyOwner)
    /// @dev Set the address of the source token and the target token by the owner
    /// @param _sourceToken The address of the source token
    /// @param _targetToken The address of the target token
    function setTokens(address _sourceToken, address _targetToken) public onlyOwner {
        // the address of the tokens should be valid
        require(_sourceToken != address(0) && _targetToken != address(0), "Invalid token address");

        sourceToken = _sourceToken;
        targetToken = _targetToken;
    }

    /// @dev Deposit target tokens to the contract by any address
    /// @notice The approving tokens will be executed by the sender
    /// @param amount The amount of tokens to deposit
    function deposit(uint amount) public {
        // the amount must be greater than 0
        require(amount > 0, "Invalid amount");

        // Transfer the tokens from the sender to this contract
        IERC20(targetToken).transferFrom(msg.sender, address(this), amount);

        emit Deposit(amount, block.timestamp);
    }

    /// @dev Withdraw tokens from the contract by the owner
    /// @dev The owner must specify the address of the token
    /// @param _tokenAddress The address of the token
    function withdraw(address _tokenAddress) public onlyOwner {
        // the owner must specify the address of the token
        require(_tokenAddress != address(0), "Invalid token address");

        // get the balance of the token
        uint balance = IERC20(_tokenAddress).balanceOf(address(this));

        // the balance must be greater than 0
        require(balance > 0, "Invalid balance");

        // Transfer the tokens from this contract to the sender
        IERC20(_tokenAddress).transfer(msg.sender, balance);

        emit Withdraw(_tokenAddress, balance, block.timestamp);
    }

    // PUBLIC FUNCTIONS
    /// @dev Convert the tokens from the source token to the target token
    /// @notice The sender must approve the contract to transfer the tokens by himself
    /// @param amount The amount of tokens to convert
    function convert(uint amount) public {
        // the amount must be greater than 0
        require(amount > 0, "Invalid amount");

        // Transfer the tokens from the sender to this contract
        IERC20(sourceToken).transferFrom(msg.sender, address(this), amount);

        // Transfer the tokens from this contract to the sender
        IERC20(targetToken).transfer(msg.sender, amount);

        emit Convert(msg.sender, amount, block.timestamp);
    }
}
