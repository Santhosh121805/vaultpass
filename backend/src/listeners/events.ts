import { listenToContractEvents } from "../services/blockchain.js";
import { updateVault, getVault, getBeneficiaries, createNotification, getUser } from "../db/client.js";
import {
  sendDistributionNoticeEmail,
  sendClaimLinkEmail,
} from "../services/email.js";
import { sendDistributionPush } from "../services/notification.js";
import { generateClaimToken } from "../utils/jwt.js";
import { env } from "../utils/env.js";

const frontendUrl = process.env.FRONTEND_URL || "https://vaultpass.app";

export async function initializeEventListener(
  chain: string,
  contractAddress: string
) {
  console.log(
    `📡 Initializing event listener for ${contractAddress} on ${chain}`
  );

  try {
    const contract = await listenToContractEvents(
      chain,
      contractAddress,
      async (eventName: string, args: any) => {
        console.log(`📡 Event received: ${eventName}`, args);

        try {
          switch (eventName) {
            case "VaultCreated":
              await handleVaultCreated(args);
              break;
            case "CheckInRecorded":
              await handleCheckInRecorded(args);
              break;
            case "DistributionTriggered":
              await handleDistributionTriggered(args);
              break;
            case "AssetsDistributed":
              await handleAssetsDistributed(args);
              break;
          }
        } catch (error) {
          console.error(`Error handling ${eventName}:`, error);
        }
      }
    );

    return contract;
  } catch (error) {
    console.error("Failed to initialize event listener:", error);
    throw error;
  }
}

async function handleVaultCreated(args: {
  owner: string;
  vaultId: string;
}) {
  console.log("🆕 VaultCreated event:", args);
  // The vault is already created from API, blockchain event confirms it
}

async function handleCheckInRecorded(args: {
  owner: string;
  timestamp: number;
}) {
  console.log("✅ CheckInRecorded event:", args);
  // Update last_checkin timestamp
  const user = await getUser(args.owner);
  if (user) {
    const vaults = await (async () => {
      const { data } = await (await import("../db/client.js")).supabase
        .from("vaults")
        .select("*")
        .eq("user_id", user.id);
      return data || [];
    })();

    for (const vault of vaults) {
      await updateVault(vault.id, {
        last_checkin: new Date(args.timestamp * 1000).toISOString(),
        status: "active",
      });

      await createNotification({
        user_id: user.id,
        vault_id: vault.id,
        type: "checkin_due",
        title: "Check-In Confirmed",
        message: "Your blockchain check-in has been confirmed",
        sent_at: new Date().toISOString(),
        read: false,
      });
    }
  }
}

async function handleDistributionTriggered(args: { vaultId: string }) {
  console.log("🔔 DistributionTriggered event:", args);

  try {
    const vault = await getVault(args.vaultId);
    if (!vault) return;

    const user = await getUser(vault.contract_address);
    if (!user) return;

    // Update vault status
    await updateVault(vault.id, { status: "triggered" });

    // Notify owner
    await sendDistributionPush(user.wallet_address);

    await createNotification({
      user_id: user.id,
      vault_id: vault.id,
      type: "distributed",
      title: "Vault Distribution Triggered",
      message:
        "Your vault has been triggered. Beneficiaries are being notified.",
      sent_at: new Date().toISOString(),
      read: false,
    });

    // Get beneficiaries and send claim links
    const beneficiaries = await getBeneficiaries(vault.id);
    for (const beneficiary of beneficiaries) {
      const claimToken = generateClaimToken(
        {
          vaultId: vault.id,
          beneficiaryId: beneficiary.id,
          walletAddress: beneficiary.wallet_address,
        },
        "7d"
      );
      const claimLink = `${frontendUrl}/claim?token=${claimToken}`;

      await sendClaimLinkEmail(
        beneficiary.email,
        claimLink,
        beneficiary.nickname
      );
    }
  } catch (error) {
    console.error("Error handling DistributionTriggered:", error);
  }
}

async function handleAssetsDistributed(args: {
  vaultId: string;
  beneficiaries: string[];
}) {
  console.log("🎉 AssetsDistributed event:", args);

  try {
    const vault = await getVault(args.vaultId);
    if (!vault) return;

    const user = await getUser(vault.contract_address);
    if (!user) return;

    // Update vault status
    await updateVault(vault.id, { status: "distributed" });

    // Notify owner
    await createNotification({
      user_id: user.id,
      vault_id: vault.id,
      type: "distributed",
      title: "Assets Distributed",
      message: "Your vault assets have been successfully distributed",
      sent_at: new Date().toISOString(),
      read: false,
    });
  } catch (error) {
    console.error("Error handling AssetsDistributed:", error);
  }
}
