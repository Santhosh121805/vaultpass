# VaultPass Backend - Complete Setup Instructions

Complete step-by-step guide to get the VaultPass backend running locally and in production.

## Table of Contents
1. [Local Development](#local-development)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing](#testing)
5. [Production Deployment](#production-deployment)

---

## Local Development

### Step 1: Prerequisites

Ensure you have installed:
- **Node.js 18+**: https://nodejs.org/
- **npm or bun**: Comes with Node.js
- **Git**: https://git-scm.com/

Verify installation:
```bash
node --version    # v18.0.0 or higher
npm --version     # 9.0.0 or higher
```

### Step 2: Clone & Setup Project

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
# or with bun:
bun install
```

### Step 3: Create Environment File

```bash
# Copy example env
cp .env.example .env

# Edit .env with your values
# Instructions below...
```

### Step 4: Configure Environment Variables

Edit `.env` file with these values:

#### Supabase Setup (Free)

1. Create account: https://supabase.com
2. Create new project (select your region)
3. Wait for project to initialize
4. Go to **Project Settings → API**

In `.env`:
```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR...
```

#### JWT Secret

Generate a random secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })) | sfc
```

In `.env`:
```env
JWT_SECRET=<paste-generated-value>
JWT_EXPIRY=7d
```

#### Blockchain RPC URLs

Get free RPC endpoints from:
- **Alchemy** (recommended): https://www.alchemy.com/ (free tier available)
- **Infura**: https://infura.io/
- **QuickNode**: https://quicknode.com/ (free tier available)

In `.env`:
```env
RPC_URL_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
RPC_URL_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
RPC_URL_POLYGON=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

#### Email Configuration

For testing, use **Gmail App Password**:

1. Enable 2-factor authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail" on "Windows"
4. Copy the 16-character password

In `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<16-char-app-password>
```

**Alternative Providers:**
- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/
- **Resend**: https://resend.com/

#### Smart Contract Address

For now, use a placeholder:
```env
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

When you deploy the smart contract, update this.

#### Other Settings

```env
PORT=3000
NODE_ENV=development

# Optional
PUSH_PROTOCOL_KEY=your-key-optional
GRACE_PERIOD_DAYS=7
CHECKIN_REMINDER_DAYS=3
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_BLOCKCHAIN_LISTENER=false
```

---

## Database Setup

### Step 1: Create Tables in Supabase

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New query**
4. Paste this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vaults table
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chain VARCHAR(50) NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  interval_days INTEGER NOT NULL CHECK (interval_days > 0 AND interval_days <= 365),
  last_checkin TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'distributed', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, contract_address)
);

-- Create beneficiaries table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  nickname VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  email VARCHAR(255) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vault_id UUID REFERENCES vaults(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('checkin_due', 'overdue', 'grace_period', 'distributed', 'claim_link_sent')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  "read" BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_vaults_status ON vaults(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_vault_id ON beneficiaries(vault_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

5. Click **Run** button
6. Check for green success message

### Step 2: Verify Tables

In Supabase Dashboard:
1. Go to **Table Editor** (left sidebar)
2. You should see all 4 tables: `users`, `vaults`, `beneficiaries`, `notifications`

---

## Running the Server

### Development Mode

```bash
npm run dev
```

You should see:
```
🚀 VaultPass Backend running on port 3000
📖 API Documentation: http://localhost:3000/
🏥 Health check: http://localhost:3000/health
```

### Type Checking

```bash
npm run typecheck
```

### Building

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### Production Mode

```bash
npm run build
npm start
```

---

## Testing the API

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-15T10:00:00.000Z"
}
```

### Get Nonce

```bash
curl -X POST http://localhost:3000/api/auth/nonce
```

### Test Email Endpoint

First, get a JWT token by:
1. Getting a nonce
2. Signing it with your wallet
3. Calling `/api/auth/verify` to get a token

Then:
```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## Docker Setup (Optional)

### Using Docker Compose

```bash
# Start all services (backend + PostgreSQL)
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

The backend will be available at `http://localhost:3000`

### Manual Docker Build

```bash
# Build image
docker build -t vaultpass-backend:latest .

# Run container
docker run -p 3000:3000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_KEY=... \
  -e JWT_SECRET=... \
  vaultpass-backend:latest
```

---

## Common Issues & Solutions

### "Cannot find module" errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force
```

### "EADDRINUSE: address already in use :::3000"

```bash
# Kill process using port 3000
# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### "Supabase connection failed"

- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Check internet connection
- Ensure Supabase project is active
- Try regenerating API key in Supabase dashboard

### "Email not sending"

- Verify SMTP credentials
- Check ENABLE_EMAIL_NOTIFICATIONS=true
- For Gmail: enable "Less secure app access" or use App Password
- Check email spam folder
- Test with `/api/auth/test-email` endpoint

### "RPC endpoint not responding"

- Verify RPC_URL is correct
- Check API key is valid
- Try using different provider (Alchemy, Infura, etc.)
- Ensure network has internet access

### TypeScript errors

```bash
# Check for type errors
npm run typecheck

# Fix ESLint issues
npm run lint -- --fix
```

---

## Next Steps

### 1. Generate Smart Contract ABI

Once you deploy the Smart Contract:
1. Update `CONTRACT_ADDRESS` in `.env`
2. Get the contract ABI from Etherscan
3. Update the ABI in `src/services/blockchain.ts`

### 2. Configure Notifications

To enable Push Protocol notifications:
1. Sign up: https://push.org/
2. Generate API key
3. Update `PUSH_PROTOCOL_KEY` in `.env`

### 3. Set Frontend URL

Update `.env`:
```env
FRONTEND_URL=http://localhost:3000  # For local dev
FRONTEND_URL=https://vaultpass.app   # For production
```

### 4. Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

### 5. Monitor & Logging

Consider setting up:
- **Error Tracking**: Sentry, LogRocket
- **Monitoring**: DataDog, New Relic
- **Logging**: LogRocket, Pino

---

## Project Structure Overview

```
backend/
├── src/
│   ├── db/              # Database client & queries
│   ├── middleware/      # Auth, rate limiting, error handling
│   ├── routes/          # API endpoint handlers
│   ├── services/        # Email, push, blockchain services
│   ├── jobs/            # Background cron jobs
│   ├── listeners/       # Blockchain event listeners
│   ├── utils/           # JWT, validation, crypto utilities
│   └── main.ts          # Express server entry point
├── dist/                # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md
├── DEPLOYMENT.md
└── API_EXAMPLES.md
```

---

## Key Features Checklist

- ✅ Wallet signature authentication
- ✅ JWT token management
- ✅ Vault CRUD operations
- ✅ Beneficiary management
- ✅ Email notifications (Nodemailer)
- ✅ Push notifications (Push Protocol ready)
- ✅ Background jobs (node-cron)
- ✅ Blockchain event listeners
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Health checks

---

## API Endpoints Summary

**Base URL:** `http://localhost:3000/api`

### Authentication
- `POST /auth/nonce` - Get nonce for signing
- `POST /auth/verify` - Verify signature & create/get user
- `POST /auth/test-email` - Send test email

### Vaults
- `GET /vault` - Get all user vaults
- `GET /vault/:vaultId` - Get vault details
- `POST /vault/create` - Create new vault
- `PUT /vault/checkin` - Record check-in
- `PUT /vault/:vaultId/cancel` - Cancel vault

### Beneficiaries
- `GET /beneficiaries/:vaultId` - List beneficiaries
- `POST /beneficiaries/add` - Add beneficiary
- `DELETE /beneficiaries/:id` - Remove beneficiary

### Notifications
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark as read
- `POST /notifications/test` - Send test notification
- `POST /notifications/validate-claim-token` - Validate claim JWT

---

## Support & Documentation

- **README.md** - Project overview and API documentation
- **API_EXAMPLES.md** - Request/response examples for all endpoints
- **DEPLOYMENT.md** - Full deployment guide for production

## Need Help?

1. Check the error message and troubleshooting section above
2. Review API_EXAMPLES.md for correct request/response formats
3. Check Supabase dashboard for database issues
4. Check SMTP provider settings for email issues
5. Verify all required environment variables are set

---

## Quick Start One-Liner (if everything is setup)

```bash
cp .env.example .env && npm install && npm run dev
```

Then visit: http://localhost:3000/health
