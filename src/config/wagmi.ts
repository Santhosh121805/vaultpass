import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, polygon, arbitrum, optimism } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "VaultPass",
  projectId: "demo-vaultpass-project-id",
  chains: [mainnet, sepolia, polygon, arbitrum, optimism],
  ssr: false,
});
