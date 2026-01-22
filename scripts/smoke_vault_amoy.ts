import hre from "hardhat";
import { readFileSync } from "node:fs";

async function main() {
    const { viem } = await hre.network.connect();

    const deployments = JSON.parse(
        readFileSync(new URL("../deployments/amoy.json", import.meta.url), "utf8")
    ) as {
        MockUSDC: `0x${string}`;
        FuturoVault: `0x${string}`;
    };

    const publicClient = await viem.getPublicClient();
    const [wallet] = await viem.getWalletClients();
    const me = wallet.account.address;

    const usdc = await viem.getContractAt(
        "contracts/MockUSDC.sol:MockUSDC",
        deployments.MockUSDC
    );

    const vault = await viem.getContractAt(
        "contracts/FuturoVault.sol:FuturoVault",
        deployments.FuturoVault
    );

    const amount = 100_000_000n; // 100 USDC (6 decimals)

    console.log("Wallet:", me);

    // SANITY: make sure vault is using the same USDC you're interacting with
    const vaultUsdc = await vault.read.usdc();
    console.log("Vault.usdc() =", vaultUsdc);
    console.log("deployments.MockUSDC =", deployments.MockUSDC);
    if (vaultUsdc.toLowerCase() !== deployments.MockUSDC.toLowerCase()) {
        throw new Error("Mismatch: Vault points to different USDC than deployments.MockUSDC. Update amoy.json or redeploy.");
    }

    // 1) Mint
    const mintHash = await usdc.write.mint([me, amount], { account: wallet.account });
    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    console.log("USDC balance after mint:", (await usdc.read.balanceOf([me])).toString());

    // 2) Approve Vault (IMPORTANT: account should be wallet.account)
    const approveHash = await usdc.write.approve(
        [deployments.FuturoVault, amount],
        { account: wallet.account }
    );
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    const allowance = await usdc.read.allowance([me, deployments.FuturoVault]);
    console.log("Allowance to Vault:", allowance.toString());

    // 3) Deposit
    const depositHash = await vault.write.deposit([amount], { account: wallet.account });
    await publicClient.waitForTransactionReceipt({ hash: depositHash });

    // DEBUG after deposit
    const walletBal = await usdc.read.balanceOf([me]);
    const vaultUsdcBal = await usdc.read.balanceOf([deployments.FuturoVault]);
    const vbal = await vault.read.balances([me]);
    console.log("Wallet USDC:", walletBal.toString());
    console.log("Vault USDC balance:", vaultUsdcBal.toString());
    console.log("Vault internal balance:", vbal.toString());

    // 4) Withdraw
    const withdrawHash = await vault.write.withdraw([amount], { account: wallet.account });
    await publicClient.waitForTransactionReceipt({ hash: withdrawHash });

    const bal2 = await usdc.read.balanceOf([me]);
    const vbal2 = await vault.read.balances([me]);
    console.log("USDC balance after withdraw:", bal2.toString());
    console.log("Vault balance after withdraw:", vbal2.toString());
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
