// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleERC20 is ERC20 {
    uint8 private _decimals = 6;

    constructor(string memory _name, address _minter) ERC20(_name, "SE20") {
    	_mint(_minter, 100000000000  * 10**18);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
