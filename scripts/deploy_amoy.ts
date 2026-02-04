import hre from "hardhat";
import { writeFileSync } from "node:fs";

async function main() {
    const connection = await hre.network.connect();

    console.log("connect() keys:", Object.keys(connection));

    const viem = (connection as any).viem;
    console.log("viem loaded?", !!viem);
    if (!viem) throw new Error("viem is undefined — hardhat-viem plugin not loaded");

    const [wallet] = await viem.getWalletClients();
    const deployer = wallet.account.address;

    console.log("Deployer:", deployer);

    const usdc = await viem.deployContract("contracts/MockUSDC.sol:MockUSDC", []);
    console.log("MockUSDC:", usdc.address);

    const vault = await viem.deployContract("contracts/FuturoVault.sol:FuturoVault", [usdc.address]);
    console.log("FuturoVault:", vault.address);

    const deployments = {
        chain: "polygon-amoy",
        MockUSDC: usdc.address,
        FuturoVault: vault.address,
        deployer,
        timestamp: new Date().toISOString(),
    };

    writeFileSync(
        new URL("../deployments/amoy.json", import.meta.url),
        JSON.stringify(deployments, null, 2),
    );

    console.log("✅ Saved deployments/amoy.json");
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
