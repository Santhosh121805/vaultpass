import { Router, Response } from "express";
import {
  getUser,
  createUser,
  createNotification,
} from "../db/client.js";
import { generateToken } from "../utils/jwt.js";
import { verifyWalletSignature, getNonce } from "../utils/crypto.js";
import {
  validateWalletAddress,
  validateEmail,
} from "../utils/validation.js";
import { AuthenticatedRequest, authMiddleware } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { testEmail } from "../services/email.js";

const router = Router();

// Get nonce for wallet signature
router.post("/nonce", authLimiter, (req: AuthenticatedRequest, res: Response) => {
  const nonce = getNonce();
  res.json({ nonce });
});

// Verify wallet signature and create/get user
router.post(
  "/verify",
  authLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { walletAddress, signature, email, nonce } = req.body;

      if (!walletAddress || !signature || !nonce) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }

      // Verify signature
      const isValid = await verifyWalletSignature(nonce, signature, walletAddress);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Check if user exists
      let user = await getUser(walletAddress);

      if (!user && email) {
        if (!validateEmail(email)) {
          return res.status(400).json({ error: "Invalid email address" });
        }
        user = await createUser(walletAddress, email);

        // Send welcome notification
        await createNotification({
          user_id: user.id,
          type: "checkin_due",
          title: "Welcome to VaultPass",
          message:
            "Your VaultPass account has been created successfully. Get started by creating your first vault.",
          sent_at: new Date().toISOString(),
          read: false,
        });
      }

      if (!user) {
        return res.status(404).json({
          error: "User not found. Please sign up with an email address.",
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        walletAddress: user.wallet_address,
      });

      res.json({
        token,
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  }
);

// Test email endpoint (authenticated)
router.post(
  "/test-email",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      await testEmail(email);

      res.json({ message: "Test email sent" });
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ error: "Failed to send test email" });
    }
  }
);

export default router;
