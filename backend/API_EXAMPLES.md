# VaultPass API Response Examples

## Authentication

### 1. Get Nonce
**Request:**
```bash
POST /api/auth/nonce
```

**Response:**
```json
{
  "nonce": "Sign this message to verify your wallet ownership: 1708940000000"
}
```

### 2. Verify Signature & Create User
**Request:**
```bash
POST /api/auth/verify
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42488",
  "signature": "0x...",
  "nonce": "Sign this message to verify your wallet ownership: 1708940000000",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5MzQ2NzZiZC1xZXJ3IiwiV2FsbGV0QWRkcmVzcyI6IjB4NzQyZDM1Q2M2NjM0QzA1MzI5MjVhM2I4NDRCYzllNzU5NWY0MjQ4OCIsImlhdCI6MTcwODk0MDAwMCwiZXhwIjoxNzA5NTQ0ODAwfQ.a8j3k2lJkl...",
  "user": {
    "id": "934676bd-qerw",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42488",
    "email": "user@example.com"
  }
}
```

---

## Vaults

### 3. Create Vault
**Request:**
```bash
POST /api/vault/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "chain": "ethereum",
  "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "intervalDays": 30,
  "email": "owner@example.com"
}
```

**Response:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user_id": "934676bd-qerw",
  "chain": "ethereum",
  "contract_address": "0x1234567890abcdef1234567890abcdef12345678",
  "interval_days": 30,
  "last_checkin": null,
  "status": "active",
  "created_at": "2024-02-15T10:00:00Z",
  "updated_at": "2024-02-15T10:00:00Z"
}
```

### 4. Get All User Vaults
**Request:**
```bash
GET /api/vault
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "user_id": "934676bd-qerw",
    "chain": "ethereum",
    "contract_address": "0x1234567890abcdef1234567890abcdef12345678",
    "interval_days": 30,
    "last_checkin": "2024-02-10T15:30:00Z",
    "status": "active",
    "created_at": "2024-02-15T10:00:00Z",
    "updated_at": "2024-02-15T10:00:00Z"
  },
  {
    "id": "a12b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "user_id": "934676bd-qerw",
    "chain": "base",
    "contract_address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "interval_days": 60,
    "last_checkin": "2024-02-01T08:00:00Z",
    "status": "active",
    "created_at": "2024-01-20T14:22:00Z",
    "updated_at": "2024-02-01T08:00:00Z"
  }
]
```

### 5. Record Check-In
**Request:**
```bash
PUT /api/vault/checkin
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "vaultId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**Response:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user_id": "934676bd-qerw",
  "chain": "ethereum",
  "contract_address": "0x1234567890abcdef1234567890abcdef12345678",
  "interval_days": 30,
  "last_checkin": "2024-02-15T13:45:00Z",
  "status": "active",
  "created_at": "2024-02-15T10:00:00Z",
  "updated_at": "2024-02-15T13:45:00Z"
}
```

---

## Beneficiaries

### 6. Add Beneficiary
**Request:**
```bash
POST /api/beneficiaries/add
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "vaultId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "nickname": "John Doe",
  "walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
  "email": "john@example.com",
  "percentage": 50
}
```

**Response:**
```json
{
  "id": "d8a5f0e1-2b3c-4d5e-6f7g-8h9i0j1k2l3m",
  "vault_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "nickname": "John Doe",
  "wallet_address": "0xabcdef1234567890abcdef1234567890abcdef12",
  "email": "john@example.com",
  "percentage": 50,
  "created_at": "2024-02-15T11:00:00Z",
  "updated_at": "2024-02-15T11:00:00Z"
}
```

### 7. Get Beneficiaries
**Request:**
```bash
GET /api/beneficiaries/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "d8a5f0e1-2b3c-4d5e-6f7g-8h9i0j1k2l3m",
    "vault_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "nickname": "John Doe",
    "wallet_address": "0xabcdef1234567890abcdef1234567890abcdef12",
    "email": "john@example.com",
    "percentage": 50,
    "created_at": "2024-02-15T11:00:00Z",
    "updated_at": "2024-02-15T11:00:00Z"
  },
  {
    "id": "e9b6g1f2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
    "vault_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "nickname": "Jane Smith",
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
    "email": "jane@example.com",
    "percentage": 50,
    "created_at": "2024-02-15T11:05:00Z",
    "updated_at": "2024-02-15T11:05:00Z"
  }
]
```

---

## Notifications

### 8. Get Notifications
**Request:**
```bash
GET /api/notifications?limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "n1a2b3c4-d5e6-7f8g-9h0i-1j2k3l4m5n6o",
    "user_id": "934676bd-qerw",
    "vault_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "type": "checkin_due",
    "title": "Check-In Due in 3 Days",
    "message": "Your vault check-in is due in 3 days",
    "sent_at": "2024-02-15T09:00:00Z",
    "read": false,
    "created_at": "2024-02-15T09:00:00Z",
    "updated_at": "2024-02-15T09:00:00Z"
  },
  {
    "id": "n2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    "user_id": "934676bd-qerw",
    "vault_id": "a12b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "type": "overdue",
    "title": "Missed Check-In",
    "message": "You missed your check-in. Grace period: 5 days remaining",
    "sent_at": "2024-02-10T08:00:00Z",
    "read": true,
    "created_at": "2024-02-10T08:00:00Z",
    "updated_at": "2024-02-10T08:00:00Z"
  }
]
```

### 9. Mark Notification as Read
**Request:**
```bash
PUT /api/notifications/n1a2b3c4-d5e6-7f8g-9h0i-1j2k3l4m5n6o/read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "n1a2b3c4-d5e6-7f8g-9h0i-1j2k3l4m5n6o",
  "user_id": "934676bd-qerw",
  "vault_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "type": "checkin_due",
  "title": "Check-In Due in 3 Days",
  "message": "Your vault check-in is due in 3 days",
  "sent_at": "2024-02-15T09:00:00Z",
  "read": true,
  "created_at": "2024-02-15T09:00:00Z",
  "updated_at": "2024-02-15T13:45:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid wallet address"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Vault not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Notification Types & Examples

### Check-In Due (3 days before deadline)
```json
{
  "type": "checkin_due",
  "title": "Check-In Due in 3 Days",
  "message": "Your vault check-in is due in 3 days"
}
```

### Overdue (after check-in deadline)
```json
{
  "type": "overdue",
  "title": "Missed Check-In",
  "message": "You missed your check-in. Grace period: 5 days remaining"
}
```

### Grace Period Warning (halfway through grace period)
```json
{
  "type": "grace_period",
  "title": "Grace Period Ending Soon",
  "message": "Distribution will be triggered in 3 days"
}
```

### Distributed (vault triggered)
```json
{
  "type": "distributed",
  "title": "Vault Triggered",
  "message": "Your vault has been triggered. Beneficiaries have been notified."
}
```

### Claim Link Sent (to beneficiaries)
```json
{
  "type": "claim_link_sent",
  "title": "Claim Link Sent",
  "message": "Claim link sent to Jane Smith"
}
```
