// SPDX-License-Identifier: MIT
//
// https://cryptomarketpool.com/how-to-write-an-if-statement-in-solidity/

pragma solidity ^0.8.0;

contract MyContract {
    // State variable to hold the symbol
    string public symbol;

    // Function to set the symbol based on the input number
    function symbolNum(uint256 _symbolNum) public {
        // If-else statement to determine the symbol
        if (_symbolNum == 1) {
            symbol = "BTC";
        } else if (_symbolNum == 2) {
            symbol = "ETH";
        } else {
            symbol = "CRAPCOIN";
        }
    }
}