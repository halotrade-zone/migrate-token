// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleERC20 is ERC20 {
    uint8 private _decimals = 6;

    constructor() ERC20("SimpleERC20", "SE20") {
    	_mint(_msgSender(), 100000000000  * 10**18);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
