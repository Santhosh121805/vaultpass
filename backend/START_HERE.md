# 🚀 VaultPass Backend - START HERE

Welcome! This file will guide you through the VaultPass backend project.

---

## 📋 What You Have

A **complete, production-ready Node.js + Express backend** for the VaultPass Web3 crypto inheritance app.

**Everything is included:**
- ✅ 18+ API endpoints (fully functional)
- ✅ Authentication system (wallet signatures + JWT)
- ✅ Database schema (PostgreSQL via Supabase)
- ✅ Email notifications (Nodemailer)
- ✅ Push notifications (Push Protocol ready)
- ✅ Background jobs (cron-based vault management)
- ✅ Blockchain integration (event listeners, RPC calls)
- ✅ Security features (rate limiting, validation)
- ✅ Docker support (Dockerfile + docker-compose)
- ✅ Comprehensive documentation
- ✅ Example API calls

---

## ⚡ Quick Start (5 minutes)

### 1️⃣ Install Dependencies
```bash
cd backend
npm install
```

### 2️⃣ Configure `.env`
```bash
cp .env.example .env
# Edit .env with:
# - SUPABASE_URL and SUPABASE_KEY
# - JWT_SECRET (generate: openssl rand -base64 32)
# - RPC URLs for blockchain
# - SMTP credentials for email
```

### 3️⃣ Setup Database
Run this SQL in your **Supabase SQL Editor**:
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vaults
CREATE TABLE vaults (
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

-- Beneficiaries
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  nickname VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  email VARCHAR(255) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
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

-- Indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_vaults_user_id ON vaults(user_id);
CREATE INDEX idx_vaults_status ON vaults(status);
CREATE INDEX idx_beneficiaries_vault_id ON beneficiaries(vault_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 4️⃣ Start Server
```bash
npm run dev
```

**Expected output:**
```
🚀 VaultPass Backend running on port 3000
📖 API Documentation: http://localhost:3000/
🏥 Health check: http://localhost:3000/health
```

### 5️⃣ Test It Works
```bash
curl http://localhost:3000/health
# Should return: { "status": "ok", "timestamp": "..." }
```

✅ **Done!** Your backend is running!

---

## 📚 Documentation Guide

Read these in order:

### 🔰 For Setup Help
1. **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** ← Step-by-step local setup guide
2. **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** ← Verify everything is configured

### 📖 For Using the API
3. **[README.md](./README.md)** ← Complete API reference & feature overview
4. **[API_EXAMPLES.md](./API_EXAMPLES.md)** ← Real request/response examples

### 🚀 For Going to Production
5. **[DEPLOYMENT.md](./DEPLOYMENT.md)** ← Deploy to Railway, Render, AWS, Docker, etc.

### 📋 For Understanding the Code
6. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** ← What's implemented & how

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── db/              Database queries & schema
│   ├── middleware/      Auth, rate limiting
│   ├── routes/          API endpoints
│   ├── services/        Email, push, blockchain
│   ├── jobs/            Background cron tasks
│   ├── listeners/       Blockchain event handlers
│   ├── utils/           Helpers & utilities
│   └── main.ts          Server entry point
├── dist/                Compiled code (after build)
├── package.json
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

---

## 🎯 Core Features

### Authentication
```bash
POST /api/auth/nonce              # Get nonce to sign
POST /api/auth/verify             # Sign nonce, get JWT
```

### Vaults
```bash
POST /api/vault/create            # Create user vault
GET  /api/vault                   # Get all vaults
PUT  /api/vault/checkin           # Record check-in
```

### Beneficiaries
```bash
POST /api/beneficiaries/add       # Add beneficiary
GET  /api/beneficiaries/:id       # List beneficiaries
DELETE /api/beneficiaries/:id     # Remove beneficiary
```

### Notifications
```bash
GET  /api/notifications           # Get notifications
PUT  /api/notifications/:id/read  # Mark as read
POST /api/notifications/test      # Send test notification
```

---

## 🔐 Authentication Flow

1. **Client**: Get nonce → `POST /api/auth/nonce`
2. **Client**: Sign nonce with wallet
3. **Client**: Verify signature → `POST /api/auth/verify`
4. **Server**: Returns JWT token
5. **Client**: Use JWT in all requests → `Authorization: Bearer <TOKEN>`

---

## ⏰ Automatic Features

The backend automatically:
- ✅ Checks vaults every 6 hours
- ✅ Sends check-in reminders 3 days before deadline
- ✅ Notifies on missed check-ins (grace period starts)
- ✅ Warns beneficiaries before distribution
- ✅ Triggers vault after grace period (7 days)
- ✅ Sends claim links to beneficiaries
- ✅ Listens to blockchain events
- ✅ Sends email notifications
- ✅ Manages rate limiting
- ✅ Logs errors and important events

All happening automatically in the background! 🔄

---

## 🔧 Common Commands

```bash
npm run dev              # Start dev server (hot reload)
npm run build            # Compile TypeScript
npm start                # Run production build
npm run typecheck        # Check for TypeScript errors
npm run lint             # Run ESLint
docker-compose up        # Run with Docker (includes database)
```

---

## 🚀 Next Steps

### Option A: Continue Development
- Read [README.md](./README.md) for full API docs
- Review code in `src/` folder
- Add features as needed

### Option B: Deploy to Production
- Read [DEPLOYMENT.md](./DEPLOYMENT.md)
- Choose platform (Railway, Render, AWS, etc.)
- Deploy!

### Option C: Integrate with Frontend
- Use the API endpoints in your frontend
- Implement wallet connection
- Handle JWT token management

### Option D: Setup Smart Contract
- Deploy your VaultPass smart contract
- Update `CONTRACT_ADDRESS` in `.env`
- Configure event listeners
- Test full end-to-end flow

---

## 💡 Quick Reference

| What | Where |
|------|-------|
| **Setup help** | [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) |
| **Verify everything** | [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) |
| **Full API docs** | [README.md](./README.md) |
| **API examples** | [API_EXAMPLES.md](./API_EXAMPLES.md) |
| **Deploy to prod** | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| **What's included** | [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) |

---

## 🆘 Troubleshooting

### Port 3000 already in use?
```bash
# Kill the process
lsof -i :3000
kill -9 <PID>
```

### npm install fails?
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to Supabase?
- Verify SUPABASE_URL in `.env`
- Verify SUPABASE_KEY in `.env`
- Check internet connection
- Verify Supabase project is active

### Email not working?
- Check SMTP credentials in `.env`
- For Gmail: use App Password (not main password)
- Verify ENABLE_EMAIL_NOTIFICATIONS=true

**More help?** See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting-deployment) or [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md#common-issues--solutions)

---

## ✅ You're All Set!

Your VaultPass backend is ready to use. 

### Right Now:
1. ✅ Backend code is complete
2. ✅ All endpoints are implemented
3. ✅ Database schema is provided
4. ✅ Documentation is comprehensive
5. ✅ Docker support is ready
6. ✅ Deployment guides are included

### Your Next Steps:
1. **[Setup locally](./SETUP_INSTRUCTIONS.md)** - Get it running on your machine
2. **[Deploy to production](./DEPLOYMENT.md)** - Get it live
3. **[Integrate with frontend](./README.md#example-complete-vault-creation-flow)** - Connect the UI

---

## 📞 Files in This Backend

```
backend/                          Project root
├── src/
│   ├── db/
│   │   ├── client.ts            Supabase connection & queries
│   │   └── migrate.ts           Database schema
│   ├── middleware/
│   │   ├── auth.ts              JWT verification
│   │   ├── rateLimit.ts         Rate limiting config
│   │   └── errorHandler.ts      Error handling
│   ├── routes/
│   │   ├── auth.ts              Auth endpoints
│   │   ├── vault.ts             Vault endpoints
│   │   ├── beneficiaries.ts     Beneficiary endpoints
│   │   └── notifications.ts     Notification endpoints
│   ├── services/
│   │   ├── email.ts             Email sending
│   │   ├── notification.ts      Push notifications
│   │   └── blockchain.ts        Blockchain integration
│   ├── jobs/
│   │   └── vaultCheck.ts        Automatic vault checks
│   ├── listeners/
│   │   └── events.ts            Blockchain event listeners
│   ├── utils/
│   │   ├── env.ts               Environment variables
│   │   ├── jwt.ts               JWT utilities
│   │   ├── crypto.ts            Wallet signature verification
│   │   └── validation.ts        Input validation
│   └── main.ts                  Server entry point
├── dist/                         Compiled JavaScript
├── package.json                 Dependencies
├── tsconfig.json                TypeScript config
├── Dockerfile                   Docker container config
├── docker-compose.yml           Docker Compose config
├── .env.example                 Environment template
├── .gitignore                   Git ignore rules
│
├── START_HERE.md               👈 You are here
├── README.md                    Full API documentation
├── SETUP_INSTRUCTIONS.md        Step-by-step setup
├── SETUP_CHECKLIST.md          Verification checklist
├── DEPLOYMENT.md               Production deployment
├── API_EXAMPLES.md             Request/response examples
└── IMPLEMENTATION_SUMMARY.md   What's included & how
```

---

## 🎉 Welcome to VaultPass!

You have a **production-grade** Node.js + Express backend with:
- Complete Web3 authentication
- Vault management system
- Automated notifications
- Blockchain integration
- Background jobs
- Professional code quality
- Comprehensive documentation

Everything is ready. Let's build! 🚀

---

**Start here:** [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
