// Category: 23_libraries
pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "./safemath.sol";

contract Libraries {
    // Attach the library functions to the types
    using SafeMath for uint256;
    using SafeMath32 for uint32;

    // Example variables
    uint public a = 10;
    uint public b = 20;

    // Functions to demonstrate the use of library functions which add two big numbers
    function add(uint _a, uint _b) public pure returns (uint) {
        return _a.add(_b);
    }
    // Functions to demonstrate the use of library functions which add two small numbers
    function sub(uint32 _a, uint32 _b) public pure returns (uint32) {
        return _a.sub(_b);
    }
    function mul(uint32 _a, uint32 _b) public pure returns (uint32) {
        return _a.mul(_b);
    }
    function div(uint32 _a, uint32 _b) public pure returns (uint32) {
        return _a.div(_b);
    }

}