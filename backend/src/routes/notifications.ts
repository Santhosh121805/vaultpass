import { Router, Response } from "express";
import {
  getUser,
  getNotifications,
  markNotificationAsRead,
  createNotification,
  getVault,
} from "../db/client.js";
import { AuthenticatedRequest, authMiddleware } from "../middleware/auth.js";
import { defaultLimiter } from "../middleware/rateLimit.js";
import { verifyClaimToken } from "../utils/jwt.js";

const router = Router();

// Get all notifications for user
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

      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const notifications = await getNotifications(user.id, limit);

      res.json(notifications);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
);

// Mark notification as read
router.put(
  "/:notificationId/read",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { notificationId } = req.params;

      const notification = await markNotificationAsRead(notificationId);

      res.json(notification);
    } catch (error) {
      console.error("Mark notification error:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  }
);

// Test notification endpoint
router.post(
  "/test",
  authMiddleware,
  defaultLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await getUser(req.user!.walletAddress);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const notification = await createNotification({
        user_id: user.id,
        type: "checkin_due",
        title: "Test Notification",
        message: "This is a test notification from VaultPass",
        sent_at: new Date().toISOString(),
        read: false,
      });

      res.json(notification);
    } catch (error) {
      console.error("Test notification error:", error);
      res.status(500).json({ error: "Failed to send test notification" });
    }
  }
);

// Validate claim token (no auth required)
router.post("/validate-claim-token", defaultLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const payload = verifyClaimToken(token);

    res.json({
      valid: true,
      vaultId: payload.vaultId,
      beneficiaryId: payload.beneficiaryId,
      walletAddress: payload.walletAddress,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
