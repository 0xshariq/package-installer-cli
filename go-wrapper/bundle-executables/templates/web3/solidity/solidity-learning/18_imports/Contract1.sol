// SPDX-License-Identifier: MIT
//
// https://cryptomarketpool.com/importing-into-a-contract

pragma solidity ^0.8.0;

import "./Contract2.sol";

contract MyContract {
    Contract2 public contract2 = new Contract2();

    function callOtherContract(uint256 a, uint256 b) public view returns (uint256) {
        return contract2.sum(a, b);
    }
}