pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

contract DataTypes {
    // Boolean
    bool public isTrue = true;

    // Integer
    int public myInt = -42;  // int8 to int256
    uint public myUint = 42; // uint8 to uint256

    // Address
    // this is my metamask ethereum public key
    // you can me some ethereum 
    address public myAddress = 0x42B603B561606Af0FeE2eE10316bEA96722a060d;  

    // Bytes
    bytes1 public myBytes1 = 0x12;
    bytes32 public myBytes32 = 0x1234567890123456789012345678901234567890123456789012345678901234;

    // String
    string public myString = "Hello, Solidity!";

    // Array
    uint[] public myArray = [1, 2, 3, 4, 5];

    // Struct
    struct Person {
        string name;
        uint age;
    }
    Person public person = Person("Alice", 30);

    // Enum
    enum Status { Pending, Active, Inactive }
    Status public status = Status.Active;
}