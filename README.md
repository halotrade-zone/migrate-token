# Solidity Migrate Token
This contract allows users to migrate their tokens from [Old AURA contract](https://bscscan.com/token/0x23c5d1164662758b3799103effe19cc064d897d6) to [CeAURA contract](https://bscscan.com/token/0x01a2df2ca978f9e75e2ecc56bf7158018ff123c2).

The migration rate is 1:1 and the migration direction is one-way (users can only migrate from Old AURA to CeAURA).

## Admin functions
### Update migration tokens
The admin can update the migration tokens by calling the `setTokens` function. This function takes two parameters: `_sourceToken` and `_targetToken`. The `_sourceToken` is the new address of the old AURA token contract and the `_targetToken` is the new address of the CeAURA token contract. Both parameters are of type `address` and must be different from the zero address.
```solidity
function setTokens(address _sourceToken, address _targetToken) public onlyOwner {}
```

### Withdraw tokens
The admin can withdraw any ERC20 tokens that were sent to the contract by calling the `withdraw` function. This function takes one parameters: `_tokenAddress`. The `_tokenAddress` is the address of the ERC20 token contract. When the function is called, the contract will transfer all the tokens of the given ERC20 token contract to the owner address.
```solidity
function withdraw(address _token) public onlyOwner {}
```

## User functions
### Deposit tokens
Any user can deposit their target tokens (CeAURA) to the contract by calling the `deposit` function. This function takes one parameter: `_amount`. The function will transfer the given amount of CeAURA tokens from the caller to the contract and emit a `Deposit` event.
```solidity
function deposit(uint256 _amount) public {}
```

### Migrate tokens
Any user can migrate their source tokens (Old AURA) to target tokens (CeAURA) by calling the `convert` function. This function takes one parameter: `_amount`. The function will get the given amount of Old AURA tokens from the caller to the contract, send the caller the same amount of CeAURA tokens from the contract, and emit a `Convert` event.
```solidity
function convert(uint256 _amount) public {}
```