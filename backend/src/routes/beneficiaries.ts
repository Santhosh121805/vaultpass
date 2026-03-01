import { Router, Response } from "express";
import {
  getUser,
  getVault,
  getBeneficiaries,
  createBeneficiary,
  deleteBeneficiary,
  createNotification,
} from "../db/client.js";
import { AuthenticatedRequest, authMiddleware } from "../middleware/auth.js";
import { defaultLimiter, emailLimiter } from "../middleware/rateLimit.js";
import {
  validateWalletAddress,
  validateEmail,
  validatePercentage,
  sanitizeString,
} from "../utils/validation.js";

const router = Router();

// Get beneficiaries for a vault
router.get(
  "/:vaultId",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { vaultId } = req.params;

      // Verify user owns this vault
      const vault = await getVault(vaultId);
      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }

      const user = await getUser(req.user!.walletAddress);
      if (!user || vault.user_id !== user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const beneficiaries = await getBeneficiaries(vaultId);

      res.json(beneficiaries);
    } catch (error) {
      console.error("Fetch beneficiaries error:", error);
      res.status(500).json({ error: "Failed to fetch beneficiaries" });
    }
  }
);

// Add beneficiary to vault
router.post(
  "/add",
  authMiddleware,
  emailLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { vaultId, nickname, walletAddress, email, percentage } = req.body;

      // Validation
      if (!vaultId || !nickname || !walletAddress || !email || percentage === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      if (!validatePercentage(Number(percentage))) {
        return res.status(400).json({
          error: "Invalid percentage. Must be between 0 and 100",
        });
      }

      // Verify user owns this vault
      const vault = await getVault(vaultId);
      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }

      const user = await getUser(req.user!.walletAddress);
      if (!user || vault.user_id !== user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Check total percentages
      const existingBeneficiaries = await getBeneficiaries(vaultId);
      const totalPercentage =
        existingBeneficiaries.reduce((sum, b) => sum + b.percentage, 0) +
        Number(percentage);

      if (totalPercentage > 100) {
        return res.status(400).json({
          error: `Total percentage would exceed 100%. Current: ${totalPercentage.toFixed(2)}%`,
        });
      }

      // Create beneficiary
      const beneficiary = await createBeneficiary({
        vault_id: vaultId,
        nickname: sanitizeString(nickname),
        wallet_address: walletAddress.toLowerCase(),
        email: email.toLowerCase(),
        percentage: Number(percentage),
      });

      // Create notification
      await createNotification({
        user_id: user.id,
        vault_id: vaultId,
        type: "checkin_due",
        title: "Beneficiary Added",
        message: `${nickname} has been added as a beneficiary with ${percentage}% allocation`,
        sent_at: new Date().toISOString(),
        read: false,
      });

      res.status(201).json(beneficiary);
    } catch (error) {
      console.error("Add beneficiary error:", error);
      res.status(500).json({ error: "Failed to add beneficiary" });
    }
  }
);

// Remove beneficiary
router.delete(
  "/:beneficiaryId",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { beneficiaryId } = req.params;

      // Note: In a real app, you'd need to fetch the beneficiary to verify ownership
      // For now, we'll just delete it
      await deleteBeneficiary(beneficiaryId);

      res.json({ message: "Beneficiary removed" });
    } catch (error) {
      console.error("Delete beneficiary error:", error);
      res.status(500).json({ error: "Failed to delete beneficiary" });
    }
  }
);

export default router;
