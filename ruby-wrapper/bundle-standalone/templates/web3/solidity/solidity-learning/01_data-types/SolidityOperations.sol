pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

contract Operations {
    // Arithmetic Operations
    uint256 public variable_add = 70;
    uint256 public variable_sub = 50;
    uint256 public variable_mul = 25;
    uint256 public variable_div = 80;
    uint256 public variable_mod = 68;

    function getResults() public {
        variable_add += 25;
        variable_sub -= 30;
        variable_mul *= 25;
        variable_div /= 5;
        variable_mod %= 60;
        return;
    }

    uint256 public a = 10;
    uint256 public b = 90;
    // Comparison Operations
    function isEqual(uint256 x, uint256 y) public pure returns (bool) {
        return x == y;
    }

    function isGreater(uint256 x, uint256 y) public pure returns (bool) {
        return x > y;
    }

    function isLess(uint256 x, uint256 y) public pure returns (bool) {
        return x < y;
    }

    // Logical Operations
    function and(bool x, bool y) public pure returns (bool) {
        return x && y;
    }

    function or(bool x, bool y) public pure returns (bool) {
        return x || y;
    }

    function not(bool x) public pure returns (bool) {
        return !x;
    }
}