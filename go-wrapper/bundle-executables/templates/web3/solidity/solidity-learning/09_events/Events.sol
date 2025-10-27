// SPDX-License-Identifier: MIT
//
// https://cryptomarketpool.com/events

pragma solidity ^0.8.0;

contract MyContract {
    string private name;


    // event declaration
    event nameEvent(string newName);

    function setName(string memory newName) public {
        name = newName;
        // event emit
        emit nameEvent(newName);
    }
}