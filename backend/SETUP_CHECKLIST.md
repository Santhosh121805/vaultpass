# VaultPass Backend - Setup Checklist

Use this checklist to ensure everything is properly configured before running the backend.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed
- [ ] Code editor/IDE (VS Code recommended)
- [ ] Internet connection for npm packages & APIs

---

## Local Development Setup

### 1. Project Setup
- [ ] Backend folder exists at `vaultpass-legacy/backend`
- [ ] Navigate to backend folder: `cd backend`
- [ ] Run `npm install` successfully (no errors)
- [ ] Copy `.env.example` to `.env`: `cp .env.example .env`

### 2. Environment Configuration

#### Supabase Setup
- [ ] Create Supabase account (https://supabase.com)
- [ ] Create new project
- [ ] Project initialized successfully
- [ ] Found API URL in Project Settings
- [ ] Found API Key in Project Settings
- [ ] Set `SUPABASE_URL` in .env
- [ ] Set `SUPABASE_KEY` in .env

#### JWT Secret
- [ ] Generated strong random JWT_SECRET (32+ bytes)
- [ ] Set `JWT_SECRET` in .env
- [ ] Set `JWT_EXPIRY` (default: 7d)

#### Blockchain RPC URLs
- [ ] Got RPC endpoint for Ethereum (Alchemy/Infura/QuickNode)
- [ ] Got RPC endpoint for Base
- [ ] Got RPC endpoint for Polygon
- [ ] Set `RPC_URL_ETHEREUM` in .env
- [ ] Set `RPC_URL_BASE` in .env
- [ ] Set `RPC_URL_POLYGON` in .env

#### Email Configuration
- [ ] Set SMTP provider (Gmail, SendGrid, etc.)
- [ ] Got SMTP credentials
- [ ] Set `SMTP_HOST` in .env
- [ ] Set `SMTP_PORT` in .env
- [ ] Set `SMTP_USER` in .env
- [ ] Set `SMTP_PASS` in .env
- [ ] Tested email credentials (optional)

#### Smart Contract
- [ ] Set `CONTRACT_ADDRESS` in .env (can be placeholder `0x0...`)

#### Optional Settings
- [ ] Set `PUSH_PROTOCOL_KEY` (optional, for Push Protocol)
- [ ] Set `GRACE_PERIOD_DAYS` (default: 7)
- [ ] Set `CHECKIN_REMINDER_DAYS` (default: 3)
- [ ] Set feature flags (ENABLE_*_NOTIFICATIONS)

### 3. Database Setup

- [ ] Log into Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Created new query
- [ ] Pasted entire migration SQL from `src/db/migrate.ts`
- [ ] Executed SQL successfully (green checkmark)
- [ ] Verified all 4 tables exist:
  - [ ] `users` table visible in Table Editor
  - [ ] `vaults` table visible
  - [ ] `beneficiaries` table visible
  - [ ] `notifications` table visible
- [ ] Verified indexes created

### 4. Environment Variables Verification

Run this to verify all environment variables are set:
```bash
npm run typecheck
```

- [ ] No missing environment variable warnings
- [ ] All required fields populated in `.env`

---

## Local Testing

### 1. Start Development Server
```bash
npm run dev
```

- [ ] Server starts without errors
- [ ] Message shows: "🚀 VaultPass Backend running on port 3000"
- [ ] No "port already in use" error (if yes, kill process on 3000)

### 2. Health Check
```bash
curl http://localhost:3000/health
```

- [ ] Returns JSON with `"status": "ok"`
- [ ] Returns valid timestamp

### 3. Root Endpoint
```bash
curl http://localhost:3000/
```

- [ ] Returns API documentation
- [ ] Shows all available endpoints

### 4. Get Nonce
```bash
curl -X POST http://localhost:3000/api/auth/nonce
```

- [ ] Returns JSON with a `nonce` field
- [ ] Nonce format: "Sign this message to verify your wallet ownership: <timestamp>"

### 5. Type Checking
```bash
npm run typecheck
```

- [ ] No TypeScript errors reported
- [ ] All imports resolve correctly

---

## Email Testing (Optional)

If you want to test email functionality:

### 1. Test Email Endpoint

First get a JWT token by completing the auth flow:
1. Get nonce
2. Sign with wallet
3. Send to `/api/auth/verify`

Then:
```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

- [ ] Request succeeds (no 5xx error)
- [ ] Check email inbox for test email
- [ ] Email arrived within 30 seconds

---

## Backend Functionality Verification

### 1. Code Quality
```bash
npm run lint
```

- [ ] No ESLint errors
- [ ] File formatting is correct

### 2. Build Process
```bash
npm run build
```

- [ ] Build completes successfully
- [ ] `dist/` folder created
- [ ] `dist/main.js` exists

### 3. Database Queries

Test with these simple checks:
- [ ] Can create user (via `/api/auth/verify`)
- [ ] Can retrieve user
- [ ] Can create vault
- [ ] Can retrieve vault
- [ ] Can add beneficiary

### 4. API Response Format
- [ ] All endpoints return valid JSON
- [ ] Error responses have `{ "error": "message" }` format
- [ ] Success responses have appropriate data

---

## Docker Testing (Optional)

If using Docker:

### 1. Docker Compose
```bash
docker-compose up
```

- [ ] PostgreSQL service starts
- [ ] Backend service starts
- [ ] No connection errors
- [ ] Backend accessible at http://localhost:3000
- [ ] Health check passes

### 2. Stop Services
```bash
docker-compose down
```

- [ ] Services stop gracefully
- [ ] No orphaned processes

---

## Rate Limiting Verification

Rate limiting should be active:

```bash
# Run 101 requests rapidly to default limiter
for i in {1..101}; do curl http://localhost:3000/health; done
```

- [ ] First 100 requests succeed
- [ ] 101st request returns 429 (Too Many Requests)

---

## Pre-Production Checklist

Before deploying to production:

### Security
- [ ] Verified JWT_SECRET is strong (32+ random bytes)
- [ ] NODE_ENV not set to "development" in production
- [ ] Database credentials are secure
- [ ] SMTP password not exposed in code
- [ ] API keys rotated/regenerated for production

### Configuration
- [ ] Updated FRONTEND_URL for your domain
- [ ] Set all required environment variables
- [ ] Verified all RPC endpoints are production (not testnet)
- [ ] EMAIL notifications tested
- [ ] Configured appropriate GRACE_PERIOD_DAYS (recommend 7)

### Database
- [ ] All migrations applied
- [ ] Backups configured (if using Supabase)
- [ ] Row Level Security configured (optional)
- [ ] Indexes verified
- [ ] Test data cleaned up

### Monitoring
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Logging configured
- [ ] Uptime monitoring set up
- [ ] Database monitoring enabled
- [ ] Rate limiting tested

### Deployment
- [ ] Deployment platform selected (Railway, Render, etc.)
- [ ] HTTPS/SSL certificate ready
- [ ] Deployment pipeline tested
- [ ] Rollback plan documented
- [ ] Monitoring dashboard set up

---

## First Run Walkthrough

Follow this to get your first successful flow:

1. **Start Server**
   ```bash
   npm run dev
   ```
   - [ ] Server running

2. **Get Nonce**
   ```bash
   curl -X POST http://localhost:3000/api/auth/nonce
   ```
   - [ ] Receive nonce

3. **Sign Nonce** (use your wallet or test signature)
   - [ ] Have wallet address
   - [ ] Have signature

4. **Verify Signature**
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify \
     -H "Content-Type: application/json" \
     -d '{
       "walletAddress": "0x...",
       "signature": "0x...",
       "nonce": "Sign this message...",
       "email": "test@example.com"
     }'
   ```
   - [ ] Receive JWT token
   - [ ] Receive user data

5. **Create Vault**
   ```bash
   curl -X POST http://localhost:3000/api/vault/create \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json" \
     -d '{
       "chain": "ethereum",
       "contractAddress": "0x...",
       "intervalDays": 30,
       "email": "owner@example.com"
     }'
   ```
   - [ ] Vault created successfully
   - [ ] Receive vault data with ID

6. **Add Beneficiary**
   ```bash
   curl -X POST http://localhost:3000/api/beneficiaries/add \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json" \
     -d '{
       "vaultId": "vault-uuid",
       "nickname": "Test Beneficiary",
       "walletAddress": "0x...",
       "email": "beneficiary@example.com",
       "percentage": 100
     }'
   ```
   - [ ] Beneficiary added
   - [ ] Percentage is 100

7. **Record Check-In**
   ```bash
   curl -X PUT http://localhost:3000/api/vault/checkin \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json" \
     -d '{"vaultId": "vault-uuid"}'
   ```
   - [ ] Check-in recorded
   - [ ] last_checkin timestamp updated

8. **Get Notifications**
   ```bash
   curl -X GET http://localhost:3000/api/notifications \
     -H "Authorization: Bearer YOUR_JWT"
   ```
   - [ ] Notifications returned
   - [ ] Shows creation and check-in notifications

---

## Troubleshooting Checklist

### If npm install fails
- [ ] Node version is 18+
- [ ] Clear npm cache: `npm cache clean --force`
- [ ] Delete node_modules and package-lock.json
- [ ] Run `npm install` again

### If server won't start
- [ ] Port 3000 is not in use (check with `lsof -i :3000`)
- [ ] All environment variables are set in .env
- [ ] Node version is compatible
- [ ] No TypeScript compilation errors: `npm run typecheck`

### If database connection fails
- [ ] SUPABASE_URL is correct format
- [ ] SUPABASE_KEY is valid
- [ ] Network connection is active
- [ ] Supabase project is not paused
- [ ] Database is not at quota limit

### If email not sending
- [ ] SMTP_HOST/PORT are correct
- [ ] SMTP_USER/PASS are correct
- [ ] ENABLE_EMAIL_NOTIFICATIONS=true
- [ ] For Gmail: enable less secure apps OR use app password
- [ ] Check .env syntax (no accidental spaces)

### If type checking fails
- [ ] All dependencies installed: `npm install`
- [ ] `tsconfig.json` exists and is valid
- [ ] Check for syntax errors in TypeScript files
- [ ] Verify source maps are generated during build

---

## Final Verification

Before considering setup complete:

```bash
# 1. All checks pass
npm run typecheck    # No errors
npm run lint         # No errors
npm run build        # Successful build

# 2. Server starts
npm run dev          # Server running

# 3. API responds
curl http://localhost:3000/health  # Returns status: ok

# 4. Authentication works
curl -X POST http://localhost:3000/api/auth/nonce  # Returns nonce

# 5. Database is connected
# (verify via Supabase dashboard - tables exist)
```

---

## Setup Complete! ✅

When all checkboxes above are checked, your VaultPass backend is ready to:
- ✅ Accept API requests
- ✅ Authenticate users
- ✅ Manage vaults
- ✅ Send notifications
- ✅ Run background jobs
- ✅ Listen to blockchain events

**Start with:** `npm run dev`

**Next step:** Integrate with frontend or deploy to production!

---

## Common Paths Forward

### 👨‍💻 Continue Development
- Read `README.md` for full API documentation
- Check `API_EXAMPLES.md` for request/response examples
- Review code in `src/` folder

### 🚀 Deploy to Production
- Read `DEPLOYMENT.md` for step-by-step deployment
- Choose hosting platform (Railway, Render, etc.)
- Set production environment variables
- Deploy!

### 🔗 Integrate with Frontend
- Use provided API endpoints in frontend
- Implement wallet connection
- Handle JWT token management
- Test complete flow

### 🔐 Smart Contract Integration
- Deploy VaultPass smart contract
- Update CONTRACT_ADDRESS in .env
- Configure event listeners
- Test blockchain integration

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Show database migrations |
| `docker-compose up` | Start with Docker |

---

Good luck with VaultPass! 🚀
