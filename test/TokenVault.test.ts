import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

describe("TokenVault", function () {
  let vault: Contract;
  let token: Contract;
  let owner: Signer;
  let user: Signer;
  let other: Signer;

  beforeEach(async () => {
    [owner, user, other] = await ethers.getSigners();

    // Разворачиваем мок ERC20 токен
    const MockToken = await ethers.getContractFactory("MockERC20");
    token = await MockToken.deploy("TestToken", "TT", 18);
    await token.waitForDeployment();

    // Минтим токены пользователю
    await token.connect(owner).mint(await user.getAddress(), ethers.parseUnits("1000", 18));

    // Разворачиваем TokenVault
    const TokenVault = await ethers.getContractFactory("TokenVault");
    vault = await TokenVault.deploy();
    await vault.waitForDeployment();
  });

  it("should deposit tokens correctly", async () => {
    await token.connect(user).approve(await vault.getAddress(), ethers.parseUnits("100", 18));
    await vault.connect(user).deposit(await token.getAddress(), ethers.parseUnits("100", 18));

    const userBalance = await vault.getUserBalance(await token.getAddress(), await user.getAddress());
    expect(userBalance).to.equal(ethers.parseUnits("100", 18));
  });

  it("should withdraw tokens correctly", async () => {
    await token.connect(user).approve(await vault.getAddress(), ethers.parseUnits("100", 18));
    await vault.connect(user).deposit(await token.getAddress(), ethers.parseUnits("100", 18));

    await vault.connect(user).withdraw(await token.getAddress(), ethers.parseUnits("40", 18));

    const userBalance = await vault.getUserBalance(await token.getAddress(), await user.getAddress());
    expect(userBalance).to.equal(ethers.parseUnits("60", 18));
  });

  it("should reject withdrawal if balance is insufficient", async () => {
    await expect(
      vault.connect(user).withdraw(await token.getAddress(), ethers.parseUnits("10", 18))
    ).to.be.revertedWith("Insufficient balance");
  });

  it("should return correct vault balance", async () => {
    await token.connect(user).approve(await vault.getAddress(), ethers.parseUnits("250", 18));
    await vault.connect(user).deposit(await token.getAddress(), ethers.parseUnits("250", 18));

    const vaultBalance = await vault.getVaultBalance(await token.getAddress());
    expect(vaultBalance).to.equal(ethers.parseUnits("250", 18));
  });
});
