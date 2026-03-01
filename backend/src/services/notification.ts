import { env } from "../utils/env.js";

// Push Protocol notification types
interface PushNotificationPayload {
  title: string;
  message: string;
  cta?: string; // Call-to-action URL
  icon?: string;
  image?: string;
}

export async function sendPushNotification(
  walletAddress: string,
  payload: PushNotificationPayload
): Promise<void> {
  if (!env.ENABLE_PUSH_NOTIFICATIONS) {
    console.log("Push notifications disabled");
    return;
  }

  try {
    // Push Protocol integration
    // This would integrate with Push Protocol's SDK
    // For now, we'll just log it
    console.log("Push notification queued for", walletAddress, payload);

    // In production, integrate with Push Protocol:
    // const response = await fetch('https://api.push.org/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${env.PUSH_PROTOCOL_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     to: `eip155:${walletAddress}`,
    //     notification: {
    //       title: payload.title,
    //       body: payload.message,
    //     },
    //     cta: payload.cta,
    //   }),
    // });

    // if (!response.ok) {
    //   throw new Error(`Push notification failed: ${response.statusText}`);
    // }
  } catch (error) {
    console.error("Failed to send push notification:", error);
    // Don't throw - push notifications are secondary
  }
}

export async function sendCheckInReminderPush(
  walletAddress: string,
  daysRemaining: number
): Promise<void> {
  await sendPushNotification(walletAddress, {
    title: "Check-In Reminder",
    message: `Your VaultPass vault check-in is due in ${daysRemaining} days`,
    cta: `${process.env.FRONTEND_URL || "https://vaultpass.app"}/dashboard`,
  });
}

export async function sendOverduePush(
  walletAddress: string,
  graceDaysRemaining: number
): Promise<void> {
  await sendPushNotification(walletAddress, {
    title: "⚠️ Missed Check-In",
    message: `Grace period: ${graceDaysRemaining} days remaining before vault is triggered`,
    cta: `${process.env.FRONTEND_URL || "https://vaultpass.app"}/dashboard`,
  });
}

export async function sendDistributionPush(
  walletAddress: string
): Promise<void> {
  await sendPushNotification(walletAddress, {
    title: "📦 Vault Distribution Initiated",
    message: "Your vault has been triggered. Beneficiaries can now claim their assets.",
    cta: `${process.env.FRONTEND_URL || "https://vaultpass.app"}/claim`,
  });
}

export async function sendBeneficiaryNotificationPush(
  walletAddress: string,
  vaultOwnerName?: string
): Promise<void> {
  const ownerInfo = vaultOwnerName ? ` from ${vaultOwnerName}` : "";
  await sendPushNotification(walletAddress, {
    title: "🔓 Assets Available",
    message: `You can now claim inherited assets${ownerInfo}`,
    cta: `${process.env.FRONTEND_URL || "https://vaultpass.app"}/claim`,
  });
}
