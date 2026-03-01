# VaultPass - Web3 Crypto Inheritance Platform

A complete decentralized application for secure crypto asset inheritance management. Users set up automated vaults with beneficiaries, receive check-in reminders, and trigger distribution after a grace period.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or bun

### Frontend Setup
```bash
cd vaultpass-legacy
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with Supabase, SMTP, RPC URLs
npm run dev
```

## 📁 Project Structure

```
vaultpass-legacy/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # UI components
│   ├── pages/            # Application pages
│   ├── config/           # Web3 configuration (Wagmi)
│   └── hooks/            # Custom React hooks
├── backend/              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Email, Push, Blockchain
│   │   ├── jobs/        # Background cron jobs
│   │   ├── db/          # Supabase client
│   │   └── utils/       # Helpers
│   └── docs/            # Setup guides
└── package.json
```

## ✨ Features

**Frontend:**
- Wallet connection (MetaMask/WalletConnect)
- Create and manage vaults
- Add beneficiaries with percentage allocation
- View vault status and check-in timers
- Claim portal for beneficiaries
- Real-time notifications

**Backend:**
- Wallet signature authentication (JWT)
- 18+ REST API endpoints
- Email notifications
- Push notifications (Push Protocol)
- Background jobs (vault checks every 6 hours)
- Blockchain event listeners
- Rate limiting & security

**Database:**
- PostgreSQL via Supabase
- Users, Vaults, Beneficiaries, Notifications tables

## 🔐 Authentication

1. User connects wallet (MetaMask)
2. Backend generates nonce
3. User signs nonce with wallet
4. Backend verifies signature → returns JWT
5. JWT used for all API requests

## 📚 Documentation

- **Frontend:** `README.md` or start in `src/App.tsx`
- **Backend:** `backend/START_HERE.md` → `backend/SETUP_INSTRUCTIONS.md`
- **Deployment:** `backend/DEPLOYMENT.md`
- **API Examples:** `backend/API_EXAMPLES.md`

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Tailwind, Wagmi |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Supabase) |
| Blockchain | Ethers.js, Web3 |
| Notifications | Nodemailer, Push Protocol |
| DevOps | Docker, docker-compose |

## 🚢 Deployment

**Backend:** Railway, Render, AWS, Docker
**Frontend:** Vercel, Netlify, AWS Amplify

See `backend/DEPLOYMENT.md` for detailed guides.

## 📝 Environment Variables

**Frontend:** `.env` (already configured)
**Backend:** `backend/.env`

```env
# Backend essentials
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
RPC_URL_ETHEREUM=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

## 🤝 Contributing

1. Clone repository
2. Create feature branch
3. Commit changes
4. Push and create PR

## 📄 License

MIT

## 🔗 Links

- **Frontend Repo:** https://github.com/Santhosh121805/vaultpass
- **Backend Docs:** `./backend/START_HERE.md`
- **Live Demo:** (Coming soon)
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## **Architecture Diagram **
<img width="1468" height="651" alt="image" src="https://github.com/user-attachments/assets/7b419f71-a019-4d04-bb1a-e871a4654a17" />


Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
