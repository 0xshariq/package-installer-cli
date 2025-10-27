// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private data;

    event DataUpdated(uint256 newValue);

    function set(uint256 _data) public {
        data = _data;
        emit DataUpdated(_data);
    }

    function get() public view returns (uint256) {
        return data;
    }
}