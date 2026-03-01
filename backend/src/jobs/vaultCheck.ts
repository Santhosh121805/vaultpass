import cron from "node-cron";
import {
  getActiveVaults,
  getTriggeredVaults,
  getBeneficiaries,
  createNotification,
  updateVault,
  getUser,
} from "../db/client.js";
import {
  sendCheckInReminderEmail,
  sendOverdueEmail,
  sendGracePeriodWarningEmail,
  sendDistributionNoticeEmail,
  sendClaimLinkEmail,
} from "../services/email.js";
import {
  sendCheckInReminderPush,
  sendOverduePush,
  sendDistributionPush,
  sendBeneficiaryNotificationPush,
} from "../services/notification.js";
import { generateClaimToken } from "../utils/jwt.js";
import { env } from "../utils/env.js";

const frontendUrl = process.env.FRONTEND_URL || "https://vaultpass.app";

export function startVaultCheckJob() {
  // Run every 6 hours
  const job = cron.schedule("0 */6 * * *", async () => {
    console.log("[VaultCheck] Starting vault check job...");

    try {
      const activeVaults = await getActiveVaults();

      for (const vault of activeVaults) {
        const user = await getUser(vault.contract_address);
        if (!user) continue;

        const now = new Date();
        const lastCheckin = vault.last_checkin
          ? new Date(vault.last_checkin)
          : null;

        if (!lastCheckin) continue;

        const daysSinceCheckin = Math.floor(
          (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24)
        );
        const dueDate = new Date(
          lastCheckin.getTime() + vault.interval_days * 24 * 60 * 60 * 1000
        );
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 1. Check if due within 3 days - send reminder
        if (daysUntilDue <= env.CHECKIN_REMINDER_DAYS && daysUntilDue > 0) {
          console.log(`[VaultCheck] Sending reminder for vault ${vault.id}`);
          await sendCheckInReminderEmail(user.email, daysUntilDue);
          await sendCheckInReminderPush(user.wallet_address, daysUntilDue);

          await createNotification({
            user_id: user.id,
            vault_id: vault.id,
            type: "checkin_due",
            title: `Check-In Due in ${daysUntilDue} Days`,
            message: `Your vault check-in is due in ${daysUntilDue} days`,
            sent_at: new Date().toISOString(),
            read: false,
          });
        }

        // 2. Check if overdue - send overdue notice
        if (daysUntilDue <= 0) {
          const gracePeriodEnd = new Date(
            dueDate.getTime() + env.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
          );
          const daysLeftInGracePeriod = Math.ceil(
            (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // First overdue notification
          if (daysUntilDue === 0) {
            console.log(`[VaultCheck] Vault ${vault.id} is overdue`);
            await sendOverdueEmail(user.email);
            await sendOverduePush(user.wallet_address, daysLeftInGracePeriod);

            await createNotification({
              user_id: user.id,
              vault_id: vault.id,
              type: "overdue",
              title: "Missed Check-In",
              message: `You missed your check-in. Grace period: ${daysLeftInGracePeriod} days remaining`,
              sent_at: new Date().toISOString(),
              read: false,
            });
          }

          // Grace period ending soon (halfway point)
          if (daysLeftInGracePeriod === Math.ceil(env.GRACE_PERIOD_DAYS / 2)) {
            console.log(
              `[VaultCheck] Grace period halfway for vault ${vault.id}`
            );
            await sendGracePeriodWarningEmail(user.email, daysLeftInGracePeriod);

            const beneficiaries = await getBeneficiaries(vault.id);
            const beneficiaryEmails = beneficiaries.map((b) => b.email);

            if (beneficiaryEmails.length > 0) {
              await sendDistributionNoticeEmail(beneficiaryEmails);
              for (const beneficiary of beneficiaries) {
                await sendBeneficiaryNotificationPush(
                  beneficiary.wallet_address
                );
              }
            }

            await createNotification({
              user_id: user.id,
              vault_id: vault.id,
              type: "grace_period",
              title: "Grace Period Ending Soon",
              message: `Distribution will be triggered in ${daysLeftInGracePeriod} days`,
              sent_at: new Date().toISOString(),
              read: false,
            });
          }

          // Grace period expired - trigger vault
          if (daysLeftInGracePeriod <= 0) {
            console.log(
              `[VaultCheck] Triggering vault ${vault.id} - grace period expired`
            );
            await updateVault(vault.id, { status: "triggered" });

            const beneficiaries = await getBeneficiaries(vault.id);

            // Send claim links to beneficiaries
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
              await sendBeneficiaryNotificationPush(
                beneficiary.wallet_address
              );

              await createNotification({
                user_id: user.id,
                vault_id: vault.id,
                type: "claim_link_sent",
                title: "Claim Link Sent",
                message: `Claim link sent to ${beneficiary.nickname}`,
                sent_at: new Date().toISOString(),
                read: false,
              });
            }

            await sendDistributionPush(user.wallet_address);

            await createNotification({
              user_id: user.id,
              vault_id: vault.id,
              type: "distributed",
              title: "Vault Triggered",
              message:
                "Your vault has been triggered. Beneficiaries have been notified.",
              sent_at: new Date().toISOString(),
              read: false,
            });
          }
        }
      }

      console.log("[VaultCheck] Vault check job completed");
    } catch (error) {
      console.error("[VaultCheck] Job failed:", error);
    }
  });

  return job;
}

// Additional job: Daily check for vaults due within 3 days
export function startDailyReminderJob() {
  const job = cron.schedule("0 9 * * *", async () => {
    console.log("[DailyReminder] Starting daily reminder job...");

    try {
      const activeVaults = await getActiveVaults();
      const now = new Date();

      for (const vault of activeVaults) {
        const user = await getUser(vault.contract_address);
        if (!user) continue;

        const lastCheckin = vault.last_checkin
          ? new Date(vault.last_checkin)
          : null;
        if (!lastCheckin) continue;

        const dueDate = new Date(
          lastCheckin.getTime() + vault.interval_days * 24 * 60 * 60 * 1000
        );
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue === env.CHECKIN_REMINDER_DAYS) {
          console.log(
            `[DailyReminder] Sending reminder for vault ${vault.id}`
          );
          await sendCheckInReminderEmail(user.email, daysUntilDue);
        }
      }

      console.log("[DailyReminder] Daily reminder job completed");
    } catch (error) {
      console.error("[DailyReminder] Job failed:", error);
    }
  });

  return job;
}
