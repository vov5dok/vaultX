import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const TokenVault = await ethers.getContractFactory("TimeLockVault");
    const vault = await TokenVault.deploy();
    await vault.waitForDeployment();

    console.log(`Deployed to ${await vault.getAddress()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
