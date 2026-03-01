import express from "express";
import { env } from "./utils/env.js";
import { defaultLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import vaultRoutes from "./routes/vault.js";
import beneficiaryRoutes from "./routes/beneficiaries.js";
import notificationRoutes from "./routes/notifications.js";
import { startVaultCheckJob, startDailyReminderJob } from "./jobs/vaultCheck.js";

const app = express();

// Middleware
app.use(express.json());
app.use(defaultLimiter);

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/notifications", notificationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "VaultPass Backend",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      vault: "/api/vault",
      beneficiaries: "/api/beneficiaries",
      notifications: "/api/notifications",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(errorHandler);

// Start background jobs
if (env.ENABLE_EMAIL_NOTIFICATIONS) {
  console.log("🔔 Starting background jobs...");
  startVaultCheckJob();
  startDailyReminderJob();
  console.log("✅ Background jobs started");
}

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 VaultPass Backend running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
