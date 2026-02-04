import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";

export default defineConfig({
  plugins: [hardhatViem],

  solidity: "0.8.28",

  networks: {
    amoy: {
      type: "http",
      chainType: "l1",
      url: process.env.POLYGON_AMOY_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});
