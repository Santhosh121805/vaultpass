import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "3000"),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_KEY: process.env.SUPABASE_KEY || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",

  // Blockchain
  RPC_URL_ETHEREUM: process.env.RPC_URL_ETHEREUM || "",
  RPC_URL_BASE: process.env.RPC_URL_BASE || "",
  RPC_URL_POLYGON: process.env.RPC_URL_POLYGON || "",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",

  // Email (Nodemailer)
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",

  // Push Protocol
  PUSH_PROTOCOL_KEY: process.env.PUSH_PROTOCOL_KEY || "",

  // Configuration
  GRACE_PERIOD_DAYS: parseInt(process.env.GRACE_PERIOD_DAYS || "7"),
  CHECKIN_REMINDER_DAYS: parseInt(process.env.CHECKIN_REMINDER_DAYS || "3"),

  // Feature Flags
  ENABLE_EMAIL_NOTIFICATIONS:
    process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false",
  ENABLE_PUSH_NOTIFICATIONS:
    process.env.ENABLE_PUSH_NOTIFICATIONS !== "false",
  ENABLE_BLOCKCHAIN_LISTENER:
    process.env.ENABLE_BLOCKCHAIN_LISTENER !== "false",
};

// Validate required environment variables
const requiredVars = [
  "SUPABASE_URL",
  "SUPABASE_KEY",
  "JWT_SECRET",
  "CONTRACT_ADDRESS",
];

for (const varName of requiredVars) {
  if (!env[varName as keyof typeof env]) {
    console.warn(`Warning: ${varName} is not set`);
  }
}
