import hre from "hardhat";

async function main() {
    const { viem } = await hre.network.connect();
    console.log("Viem loaded?", !!viem);

    const usdc = await viem.deployContract("contracts/MockUSDC.sol:MockUSDC", []);
    console.log("MockUSDC deployed to:", usdc.address);

    const vault = await viem.deployContract("contracts/FuturoVault.sol:FuturoVault", [usdc.address]);
    console.log("FuturoVault deployed to:", vault.address);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
