# VaultPass Backend API

A Node.js + Express backend for the VaultPass Web3 crypto inheritance application. Handles user authentication, vault management, beneficiary tracking, and automated notifications.

## Features

- 🔐 **Wallet Signature Authentication** - Sign in with Ethereum/EVM wallets
- 💼 **Vault Management** - Create and manage inheritance vaults
- 👥 **Beneficiary Tracking** - Add beneficiaries with percentage allocations
- 🔔 **Smart Notifications** - Email and push notifications with grace periods
- ⏰ **Automated Background Jobs** - Cron jobs for check-in reminders and vault triggers
- 🔗 **Blockchain Integration** - Listen to on-chain vault events
- 🎟️ **Magic Claim Links** - Generate secure self-custodial claim tokens
- ⛓️ **Multi-Chain Support** - Ethereum, Base, Polygon

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT + Wallet Signatures (ECDSA)
- **Blockchain**: Ethers.js v6
- **Notifications**: 
  - Email: Nodemailer
  - Push: Push Protocol
- **Scheduling**: node-cron
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase account (free tier works)
- SMTP credentials (Gmail, SendGrid, etc.)
- RPC endpoints (Alchemy, Infura, or similar)

### Installation

1. **Clone and navigate to backend folder:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
# or
bun install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# JWT
JWT_SECRET=your-secure-random-string
JWT_EXPIRY=7d

# Server
PORT=3000
NODE_ENV=development

# Blockchain RPC URLs
RPC_URL_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
RPC_URL_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
RPC_URL_POLYGON=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Smart Contract
CONTRACT_ADDRESS=0x...

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Push Protocol
PUSH_PROTOCOL_KEY=your-push-key

# Configuration
GRACE_PERIOD_DAYS=7
CHECKIN_REMINDER_DAYS=3

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_BLOCKCHAIN_LISTENER=true
```

4. **Set up database schema:**

Run the migration SQL in your Supabase dashboard:

```bash
npm run db:migrate
```

Then copy the SQL output and run it in **Supabase → SQL Editor**.

5. **Start development server:**

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

```
POST   /api/auth/nonce           — Get nonce for wallet signature
POST   /api/auth/verify          — Verify signature, create user, return JWT
POST   /api/auth/test-email      — Send test email (authenticated)
```

### Vaults

```
GET    /api/vault                — Get all user vaults
GET    /api/vault/:vaultId       — Get vault details
POST   /api/vault/create         — Create new vault
PUT    /api/vault/checkin        — Record check-in
PUT    /api/vault/:vaultId/cancel — Cancel vault
```

### Beneficiaries

```
GET    /api/beneficiaries/:vaultId — List vault beneficiaries
POST   /api/beneficiaries/add    — Add beneficiary to vault
DELETE /api/beneficiaries/:id    — Remove beneficiary
```

### Notifications

```
GET    /api/notifications        — Get user notifications
PUT    /api/notifications/:id/read — Mark as read
POST   /api/notifications/test   — Send test notification
POST   /api/notifications/validate-claim-token — Validate claim JWT
```

## Authentication Flow

### 1. Get Nonce
```bash
curl -X POST http://localhost:3000/api/auth/nonce
```

Response:
```json
{
  "nonce": "Sign this message to verify your wallet ownership: 1708940000000"
}
```

### 2. Sign Message

User signs the nonce with their wallet (MetaMask, RainbowKit, etc.)

### 3. Verify & Get JWT

```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42488",
    "signature": "0x...",
    "nonce": "Sign this message...",
    "email": "user@example.com"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "walletAddress": "0x742d35...",
    "email": "user@example.com"
  }
}
```

### 4. Use JWT for Protected Routes

```bash
curl -X GET http://localhost:3000/api/vault \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Database Schema

### Users
```sql
id UUID PRIMARY KEY
wallet_address VARCHAR(42) UNIQUE
email VARCHAR(255)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Vaults
```sql
id UUID PRIMARY KEY
user_id UUID (FK → users)
chain VARCHAR(50) -- ethereum, base, polygon
contract_address VARCHAR(42)
interval_days INTEGER -- 1-365
last_checkin TIMESTAMPTZ
status VARCHAR(20) -- active, triggered, distributed, canceled
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Beneficiaries
```sql
id UUID PRIMARY KEY
vault_id UUID (FK → vaults)
nickname VARCHAR(255)
wallet_address VARCHAR(42)
email VARCHAR(255)
percentage NUMERIC(5,2) -- 0-100
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Notifications
```sql
id UUID PRIMARY KEY
user_id UUID (FK → users)
vault_id UUID (FK → vaults, nullable)
type VARCHAR(50) -- checkin_due, overdue, grace_period, distributed
title VARCHAR(255)
message TEXT
sent_at TIMESTAMPTZ
read BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## Background Jobs

### Vault Check Job (Every 6 hours)

1. **Check-in Due** (within 3 days)
   - Send email reminder
   - Send push notification
   - Create notification record

2. **Overdue** (check-in missed)
   - Send overdue email to owner
   - Send warning push notification
   - Mark vault as "overdue"

3. **Grace Period Halfway**
   - Email owner and beneficiaries
   - Notify beneficiaries about upcoming distribution

4. **Grace Period Expired** (7 days)
   - Trigger vault distribution
   - Generate claim tokens for each beneficiary
   - Send claim links via email
   - Push notifications to beneficiaries

### Daily Reminder Job (9 AM every day)

- Send email reminder to users with check-ins due within 3 days

## Magic Claim Links

When a vault is triggered, each beneficiary receives a unique claim link:

```
https://vaultpass.app/claim?token=<jwt>
```

The JWT contains:
```json
{
  "vaultId": "uuid",
  "beneficiaryId": "uuid",
  "walletAddress": "0x...",
  "exp": 1708950000
}
```

Tokens expire in 7 days. Beneficiaries can claim assets without additional wallet login.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

HTTP status codes:
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Too many requests (rate limited)
- `500` - Server error

## Rate Limiting

- **Default**: 100 requests/15 minutes
- **Auth**: 10 requests/15 minutes
- **Email**: 5 requests/hour

## Development

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

### Production
```bash
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── client.ts          # Supabase client & queries
│   │   └── migrate.ts         # Database migrations
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification
│   │   ├── rateLimit.ts       # Rate limiting
│   │   └── errorHandler.ts    # Error handling
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── vault.ts           # Vault CRUD
│   │   ├── beneficiaries.ts   # Beneficiary management
│   │   └── notifications.ts   # Notification endpoints
│   ├── services/
│   │   ├── email.ts           # Email notifications
│   │   ├── notification.ts    # Push notifications
│   │   └── blockchain.ts      # Blockchain utilities
│   ├── jobs/
│   │   └── vaultCheck.ts      # Background cron jobs
│   ├── listeners/
│   │   └── events.ts          # Blockchain event listener
│   ├── utils/
│   │   ├── env.ts             # Environment config
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── crypto.ts          # Signature verification
│   │   └── validation.ts      # Input validation
│   └── main.ts                # Express server setup
├── package.json
├── tsconfig.json
└── .env.example
```

## Security Considerations

✅ **Implemented**
- JWT token-based authentication
- ECDSA wallet signature verification
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS headers configured
- Protection against common attacks

⚠️ **To Consider**
- Add request logging/monitoring
- Implement API key for third-party integrations
- Use HTTPS in production
- Enable database encryption at rest
- Add request signing for webhooks
- Implement API versioning

## Deployment

### Supabase Setup

1. Create a free Supabase project: https://supabase.com
2. Get your API URL and anon key from Project Settings
3. Run migrations in SQL Editor
4. Enable RLS (Row Level Security) as needed

### Railway/Render Deployment

```bash
# Build
npm run build

# Set environment variables in platform dashboard
# Run start command: npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing Email Configuration

```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Troubleshooting

### "Invalid token" error
- Check JWT_SECRET is set correctly
- Ensure token hasn't expired (default 7 days)
- Verify token format in Authorization header

### Email not sending
- Check SMTP credentials in .env
- Verify ENABLE_EMAIL_NOTIFICATIONS=true
- Check email logs in Nodemailer/SMTP server
- Test with /auth/test-email endpoint

### Database connection error
- Verify SUPABASE_URL and SUPABASE_KEY
- Check database isn't full (Supabase free limit)
- Run migrations first

### Events not being triggered
- Check RPC_URL endpoints are valid
- Verify CONTRACT_ADDRESS is correct for the chain
- Ensure blockchain listener is enabled (ENABLE_BLOCKCHAIN_LISTENER=true)

## API Documentation

### Example: Complete Vault Creation Flow

```bash
# 1. Get nonce
curl -X POST http://localhost:3000/api/auth/nonce

# 2. Sign nonce with wallet, get token via /verify

# 3. Create vault
curl -X POST http://localhost:3000/api/vault/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "ethereum",
    "contractAddress": "0x...",
    "intervalDays": 30,
    "email": "owner@example.com"
  }'

# 4. Add beneficiary
curl -X POST http://localhost:3000/api/beneficiaries/add \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vaultId": "vault-uuid",
    "nickname": "John",
    "walletAddress": "0x...",
    "email": "john@example.com",
    "percentage": 50
  }'

# 5. Record check-in
curl -X PUT http://localhost:3000/api/vault/checkin \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vaultId": "vault-uuid"}'
```

## License

MIT

## Support

For issues and feature requests: [GitHub Issues](https://github.com/your-repo/issues)
