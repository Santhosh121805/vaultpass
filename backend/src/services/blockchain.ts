import { ethers } from "ethers";
import { env } from "../utils/env.js";

// Simple ABI for the VaultPass contract
// In production, use the full contract ABI
const VAULT_ABI = [
  "event VaultCreated(address indexed owner, uint256 indexed vaultId)",
  "event CheckInRecorded(address indexed owner, uint256 timestamp)",
  "event DistributionTriggered(uint256 indexed vaultId)",
  "event AssetsDistributed(uint256 indexed vaultId, address[] beneficiaries)",
];

const providers: { [key: string]: ethers.Provider } = {
  ethereum: env.RPC_URL_ETHEREUM ? new ethers.JsonRpcProvider(env.RPC_URL_ETHEREUM) : null,
  base: env.RPC_URL_BASE ? new ethers.JsonRpcProvider(env.RPC_URL_BASE) : null,
  polygon: env.RPC_URL_POLYGON ? new ethers.JsonRpcProvider(env.RPC_URL_POLYGON) : null,
};

export function getProvider(chain: string): ethers.Provider {
  const provider = providers[chain.toLowerCase()];
  if (!provider) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  return provider;
}

export async function listenToContractEvents(
  chain: string,
  contractAddress: string,
  onEvent: (eventName: string, args: any) => Promise<void>
): Promise<ethers.Contract> {
  try {
    const provider = getProvider(chain);
    const contract = new ethers.Contract(contractAddress, VAULT_ABI, provider);

    contract.on("VaultCreated", async (owner, vaultId) => {
      await onEvent("VaultCreated", { owner, vaultId });
    });

    contract.on("CheckInRecorded", async (owner, timestamp) => {
      await onEvent("CheckInRecorded", { owner, timestamp });
    });

    contract.on("DistributionTriggered", async (vaultId) => {
      await onEvent("DistributionTriggered", { vaultId });
    });

    contract.on("AssetsDistributed", async (vaultId, beneficiaries) => {
      await onEvent("AssetsDistributed", { vaultId, beneficiaries });
    });

    console.log(`Listening to ${contractAddress} on ${chain}`);
    return contract;
  } catch (error) {
    console.error("Failed to listen to contract events:", error);
    throw error;
  }
}

export async function getBlockNumber(chain: string): Promise<number> {
  const provider = getProvider(chain);
  return await provider.getBlockNumber();
}

export async function getPastEvents(
  chain: string,
  contractAddress: string,
  eventName: string,
  fromBlock: number = 0,
  toBlock: string | number = "latest"
): Promise<any[]> {
  try {
    const provider = getProvider(chain);
    const contract = new ethers.Contract(contractAddress, VAULT_ABI, provider);

    // Get past events
    // Note: This is a simplified approach. In production, use more robust event filtering
    const logs = await provider.getLogs({
      address: contractAddress,
      fromBlock,
      toBlock,
    });

    return logs;
  } catch (error) {
    console.error("Failed to get past events:", error);
    throw error;
  }
}

export function validateChain(chain: string): boolean {
  return ["ethereum", "base", "polygon"].includes(chain.toLowerCase());
}

export function validateContractAddress(address: string): boolean {
  return ethers.isAddress(address);
}
