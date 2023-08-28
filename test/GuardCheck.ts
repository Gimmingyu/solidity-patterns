import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("GuardCheck", function () {
    async function deployContract() {
        const factory = await ethers.getContractFactory("GuardCheck");
        const contract = await factory.deploy();
        await contract.deployed();
        return contract;
    }

});