// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract GuardCheck {
    modifier addressGuard(address addr) {
        require(addr != address(0), "address should be a valid address");

        _;
    }

    modifier valueGuard(uint value) {
        require(msg.value != 0, "msg.value should be a valid value");

        _;
    }

    function donate(
        address addr
    ) public payable addressGuard(addr) valueGuard(msg.value) {
        // ...
    }
}
