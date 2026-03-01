import { Router, Response } from "express";
import {
  getUser,
  getUserVaults,
  getVault,
  createVault,
  updateVault,
  createNotification,
} from "../db/client.js";
import { AuthenticatedRequest, authMiddleware } from "../middleware/auth.js";
import { defaultLimiter } from "../middleware/rateLimit.js";
import {
  validateWalletAddress,
  validateInterval,
  validateEmail,
  sanitizeString,
} from "../utils/validation.js";
import { validateChain, validateContractAddress } from "../services/blockchain.js";

const router = Router();

// Get vault details by vault ID
router.get(
  "/:vaultId",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { vaultId } = req.params;

      const vault = await getVault(vaultId);

      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }

      // Verify user owns this vault
      const user = await getUser(req.user!.walletAddress);
      if (!user || vault.user_id !== user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      res.json(vault);
    } catch (error) {
      console.error("Fetch vault error:", error);
      res.status(500).json({ error: "Failed to fetch vault" });
    }
  }
);

// Get all vaults for user
router.get(
  "/",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await getUser(req.user!.walletAddress);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const vaults = await getUserVaults(user.id);

      res.json(vaults);
    } catch (error) {
      console.error("Fetch vaults error:", error);
      res.status(500).json({ error: "Failed to fetch vaults" });
    }
  }
);

// Create new vault
router.post(
  "/create",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { chain, contractAddress, intervalDays, email } = req.body;

      // Validation
      if (!chain || !contractAddress || !intervalDays) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!validateChain(chain)) {
        return res.status(400).json({ error: "Invalid chain" });
      }

      if (!validateContractAddress(contractAddress)) {
        return res.status(400).json({ error: "Invalid contract address" });
      }

      if (!validateInterval(intervalDays)) {
        return res.status(400).json({
          error: "Invalid interval. Must be between 1 and 365 days",
        });
      }

      // Get or create user
      let user = await getUser(req.user!.walletAddress);

      if (!user && email) {
        if (!validateEmail(email)) {
          return res.status(400).json({ error: "Invalid email address" });
        }
        // Create user if doesn't exist
        user = await getUser(req.user!.walletAddress);
        if (!user) {
          // This shouldn't happen but handle it
          return res
            .status(400)
            .json({ error: "Cannot create vault without user" });
        }
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create vault
      const vault = await createVault({
        user_id: user.id,
        chain: chain.toLowerCase(),
        contract_address: contractAddress.toLowerCase(),
        interval_days: intervalDays,
        last_checkin: null,
        status: "active",
      });

      // Create notification
      await createNotification({
        user_id: user.id,
        vault_id: vault.id,
        type: "checkin_due",
        title: "Vault Created",
        message: `Your vault has been created with a ${intervalDays} day check-in interval`,
        sent_at: new Date().toISOString(),
        read: false,
      });

      res.status(201).json(vault);
    } catch (error) {
      console.error("Create vault error:", error);
      res.status(500).json({ error: "Failed to create vault" });
    }
  }
);

// Record check-in
router.put(
  "/checkin",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { vaultId } = req.body;

      if (!vaultId) {
        return res.status(400).json({ error: "vaultId is required" });
      }

      const vault = await getVault(vaultId);

      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }

      // Verify user owns this vault
      const user = await getUser(req.user!.walletAddress);
      if (!user || vault.user_id !== user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Update last check-in timestamp
      const updatedVault = await updateVault(vaultId, {
        last_checkin: new Date().toISOString(),
        status: "active", // Reset status if it was overdue
      });

      // Create notification
      await createNotification({
        user_id: user.id,
        vault_id: vaultId,
        type: "checkin_due",
        title: "Check-In Recorded",
        message: "Your check-in has been recorded. Vault is active.",
        sent_at: new Date().toISOString(),
        read: false,
      });

      res.json(updatedVault);
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({ error: "Failed to record check-in" });
    }
  }
);

// Cancel vault
router.put(
  "/:vaultId/cancel",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { vaultId } = req.params;

      const vault = await getVault(vaultId);

      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }

      // Verify user owns this vault
      const user = await getUser(req.user!.walletAddress);
      if (!user || vault.user_id !== user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updatedVault = await updateVault(vaultId, { status: "canceled" });

      res.json(updatedVault);
    } catch (error) {
      console.error("Cancel vault error:", error);
      res.status(500).json({ error: "Failed to cancel vault" });
    }
  }
);

export default router;
