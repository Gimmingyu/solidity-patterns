import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("GuardCheck", function () {
  async function deployContract() {
    const factory = await ethers.getContractFactory("GuardCheck");
    const contract = await factory.deploy();

    const [owner, user] = await ethers.getSigners();
    return { contract, owner, user };
  }

  it("should be deployed", async function () {
    const { contract } = await deployContract();

    const address = await contract.getAddress();

    expect(address).not.equal("0");
  });

  it("should be pass", async function () {
    const { contract, owner, user } = await loadFixture(deployContract);

    await contract.connect(owner).donate(user.address, {
      value: ethers.parseEther("1"),
    });
  });
});
