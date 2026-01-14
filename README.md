# Trading React Dashboard

A modern, real-time trading dashboard for MT4 accounts with MetaAPI integration.

## Features

- 📊 **Real-time Dashboard**: Account balance, equity, performance metrics
- 📈 **Live Positions**: Monitor open positions with auto-refresh
- 📋 **Trading Log**: Complete trading history with filters and pagination
- 🎨 **Modern UI**: Beautiful, responsive design with brand theming
- 🔐 **Secure Authentication**: JWT-based authentication
- 🔄 **Auto-refresh**: Live data updates

## Quick Start

### For Development

1. **Clone and Install**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

2. **Configure Environment**

   ```bash
   # Server .env
   cd server
   cp .env.example .env
   # Edit .env with your MetaAPI token

   # Client .env
   cd ../client
   # Create .env with: VITE_API_URL=http://localhost:3001
   ```

3. **Start Development Servers**

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

4. **Access Dashboard**
   - Open http://localhost:5173 / https://aperiox-dashboard.vercel.app
   - Login with demo credentials (see below)

### Demo Credentials

```
Username: investor1
Password: password123
```

## Client Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions.

### Quick Client Setup

```bash
cd server
node utils/manageUsers.js add \
  --username client_username \
  --email client@email.com \
  --password SecurePassword123 \
  --accountId YOUR_METAAPI_ACCOUNT_ID \
  --name "Client Name"
```

## User Management

### Add Client

```bash
cd server
node utils/manageUsers.js add --username USERNAME --email EMAIL --password PASSWORD --accountId ACCOUNT_ID --name "NAME"
```

### List Clients

```bash
node utils/manageUsers.js list
```

### Update Client

```bash
node utils/manageUsers.js update --username USERNAME --password NEW_PASSWORD
```

### Remove Client

```bash
node utils/manageUsers.js remove --username USERNAME
```

## Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── hooks/         # Custom hooks
│   └── dist/              # Production build
│
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── services/         # MetaAPI service
│   ├── middleware/       # Auth & error handling
│   └── utils/            # Utilities
│
├── DEPLOYMENT_GUIDE.md   # Production deployment guide
└── CLIENT_ONBOARDING.md  # Client onboarding process
```

## Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: Complete deployment guide
- **[CLIENT_ONBOARDING.md](./CLIENT_ONBOARDING.md)**: How to onboard clients
- **[server/SETUP.md](./server/SETUP.md)**: MetaAPI setup instructions

## Tech Stack

**Frontend:**

- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Vite

**Backend:**

- Node.js
- Express
- MetaAPI.cloud SDK
- JWT Authentication
- bcrypt

## Security

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ HTTPS required in production
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers

## License

ISC

## Support

For deployment and client management questions, refer to:

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [CLIENT_ONBOARDING.md](./CLIENT_ONBOARDING.md)
