# VaultPass Backend - Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 18+ or Docker
- PostgreSQL database (Supabase recommended)
- SMTP server for emails
- RPC endpoints for blockchain
- SSL certificate (if using custom domain)

## Option 1: Railway.app

### Steps
1. **Create Railway project**: https://railway.app
2. **Connect GitHub repository**
3. **Add PostgreSQL plugin**
4. **Set environment variables**:
   - Copy all from `.env.example`
   - Generate new `JWT_SECRET`: `openssl rand -base64 32`
5. **Deploy**: Push to GitHub, Railway auto-deploys

### Railway Environment Variables Script
```bash
railway variable set SUPABASE_URL=https://...
railway variable set SUPABASE_KEY=...
railway variable set JWT_SECRET=$(openssl rand -base64 32)
railway variable set NODE_ENV=production
# ... add other variables
```

## Option 2: Render.com

### Steps
1. **Create Web Service**: https://render.com
2. **Connect GitHub repo** (backend folder)
3. **Add PostgreSQL Database**
4. **Configure**:
   - Runtime: Node
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. **Add environment variables** in settings

## Option 3: Docker + Self-Hosted

### Build and Run
```bash
# Build image
docker build -t vaultpass-backend .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=... \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  vaultpass-backend
```

### Docker Compose (with PostgreSQL)
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Option 4: AWS EC2 + PM2

### Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup project
git clone <repo>
cd backend
npm install
npm run build

# Create PM2 ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vaultpass-backend',
    script: './dist/main.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.vaultpass.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Supabase Database Setup

### Create Tables
Run in Supabase SQL Editor:

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
  interval_days INTEGER NOT NULL,
  last_checkin TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beneficiaries
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  nickname VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  email VARCHAR(255) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vault_id UUID REFERENCES vaults(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
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
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

### Enable Row Level Security (optional)
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own vaults
CREATE POLICY "Users can view own vaults"
  ON vaults FOR SELECT
  USING (user_id = auth.uid());
```

## Environment Variables

### Required for Production
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# JWT (generate: openssl rand -base64 32)
JWT_SECRET=<32-byte-random-string>
JWT_EXPIRY=7d

# Server
PORT=3000
NODE_ENV=production

# Blockchain RPC (use premium providers like Alchemy, Infura)
RPC_URL_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
RPC_URL_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
RPC_URL_POLYGON=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Smart Contract
CONTRACT_ADDRESS=0x...

# Email (use SendGrid, Gmail App Password, etc.)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx...

# Optional: Push Protocol
PUSH_PROTOCOL_KEY=your-key

# Configuration
GRACE_PERIOD_DAYS=7
CHECKIN_REMINDER_DAYS=3

# Features
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_BLOCKCHAIN_LISTENER=true
```

## Monitoring & Logging

### Application Monitoring
```bash
# Install pm2-monitoring (optional)
pm2 install pm2-monitoring

# View logs
pm2 logs vaultpass-backend

# Real-time monitoring
pm2 monit
```

### Error Tracking (Sentry)
```bash
npm install @sentry/node
```

Then in `main.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Database Monitoring
- Supabase Dashboard: https://app.supabase.com
- Monitor query performance and storage usage

## SSL/HTTPS

### Let's Encrypt with Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.vaultpass.app
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name api.vaultpass.app;

    ssl_certificate /etc/letsencrypt/live/api.vaultpass.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.vaultpass.app/privkey.pem;

    # Rest of config...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.vaultpass.app;
    return 301 https://$server_name$request_uri;
}
```

## Database Backups

### Supabase Automatic Backups
- Free tier: 7-day backups
- Pro tier: 30-day backups
- Access via Supabase Dashboard

### Manual Backup
```bash
# Export from Supabase
pg_dump postgresql://user:password@host/database > backup.sql

# Restore
psql postgresql://user:password@host/database < backup.sql
```

## Health Checks

### Health Endpoint
```bash
curl https://api.vaultpass.app/health
# Response: { "status": "ok", "timestamp": "2024-02-15T..." }
```

## Performance Optimization

### Database Indexes
Already created in schema for:
- `users(wallet_address)` - Fast user lookups
- `vaults(user_id)` - Fast vault queries per user
- `notifications(user_id)` - Fast notification queries

### Caching Strategy
Consider adding Redis for:
- JWT blacklisting
- Rate limit counters
- Session caching

```bash
npm install redis
```

## Troubleshooting Deployment

### Port Already In Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Memory Issues
```bash
# Increase Node heap
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Database Connection Timeout
- Check Supabase URL/key are correct
- Verify network connectivity
- Check database isn't at capacity

### Email Not Sending
- Verify SMTP credentials
- Check spam folder
- Enable "Less secure app access" (Gmail)
- Use app password instead of main password

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS/SSL in production
- [ ] Set NODE_ENV=production
- [ ] Enable database backups
- [ ] Set up monitoring/alerting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable request logging
- [ ] Set up rate limiting per IP
- [ ] Regular security updates: `npm audit fix`

## Rollback Plan

### Railway/Render
- One-click rollback to previous deployment
- Check platform dashboard

### PM2
```bash
# View previous deployments
pm2 list

# Restart previous version
pm2 restart vaultpass-backend
```

### Docker
```bash
# Stop current container
docker stop vaultpass-backend

# Run previous image
docker run -d -p 3000:3000 vaultpass-backend:previous-tag
```

## Support & Monitoring

- **Logs**: Check platform-specific logs (Railway, Render, PM2)
- **Errors**: Use Sentry or similar for error tracking
- **Uptime**: Use UptimeRobot or similar for monitoring

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Supabase Docs](https://supabase.com/docs)
- [PM2 Docs](https://pm2.keymetrics.io/)
