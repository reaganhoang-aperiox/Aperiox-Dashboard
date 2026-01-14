# 📊 Trading React Dashboard

A full-stack trading dashboard for MetaTrader 4 with real-time data visualization, built with React, TypeScript, and Express.js.

![Trading Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### Frontend

- 📈 **Real-time Trading Dashboard** - Live account metrics and statistics
- 🔐 **Secure Authentication** - JWT-based investor login system
- 📊 **Interactive Charts** - Win rate, profit/loss visualization with Recharts
- 💼 **Position Tracking** - Monitor open positions and orders
- 📜 **Trading History** - Complete deal history with filtering
- 🎨 **Modern UI** - Beautiful dark theme with Tailwind CSS and shadcn/ui
- 🔄 **Auto-refresh** - Real-time data updates every 30 seconds
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

### Backend

- 🔌 **MetaApi Integration** - Connect to MetaTrader 4 accounts
- 🔒 **JWT Authentication** - Secure investor access
- 📡 **RESTful API** - Clean and documented endpoints
- 🛡️ **Security** - Rate limiting, CORS, Helmet.js
- 📊 **Real-time Data** - Account info, positions, and deal history
- 🔄 **Error Handling** - Comprehensive error responses

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MetaApi.cloud account ([Sign up free](https://app.metaapi.cloud/))
- MetaTrader 4 account with investor password

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd trading-react-dashboard
   ```

2. **Install dependencies**

   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd api-meta-trader-4
   npm install
   cd ..
   ```

3. **Configure Backend**

   ```bash
   cd api-meta-trader-4
   cp .env.example .env
   # Edit .env and add your MetaApi credentials
   ```

4. **Configure Frontend**

   ```bash
   # Already configured with .env file
   # VITE_API_URL=http://localhost:3001
   ```

5. **Start the application**

   **Windows:**

   ```bash
   # Double-click start.bat
   # OR run:
   .\start.ps1
   ```

   **macOS/Linux:**

   ```bash
   # Terminal 1 - Backend
   cd api-meta-trader-4 && npm start

   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Access the dashboard**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Default Login:
     - Username: `investor1`
     - Password: `password123`

## 📚 Documentation

- [📖 Full Integration Guide](INTEGRATION.md) - Complete integration documentation
- [🚀 Quick Start Guide](QUICKSTART.md) - Fast setup instructions
- [🔧 Backend Setup](api-meta-trader-4/GETTING_STARTED.md) - Backend configuration
- [📡 API Documentation](api-meta-trader-4/README.md) - API endpoints reference

## 🏗️ Project Structure

```
trading-react-dashboard/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── LoginForm.tsx       # Authentication UI
│   │   └── Sidebar.tsx         # Navigation sidebar
│   ├── services/               # API services
│   │   ├── api.ts             # Backend API calls
│   │   └── auth.ts            # Authentication service
│   ├── hooks/                  # Custom React hooks
│   │   └── useTradingData.ts  # Data fetching hook
│   └── App.tsx                 # Main application
├── api-meta-trader-4/           # Backend API server
│   ├── routes/                 # API routes
│   │   ├── auth.js            # Authentication endpoints
│   │   └── account.js         # Account data endpoints
│   ├── services/               # Business logic
│   │   └── metaApiService.js  # MetaApi integration
│   ├── middleware/             # Express middleware
│   └── server.js              # Express server
├── .env                         # Frontend environment
├── start.bat                    # Windows startup script
└── start.ps1                    # PowerShell startup script
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - Investor login
- `POST /api/auth/register` - Register new investor
- `POST /api/auth/refresh` - Refresh access token

### Account Data

- `GET /api/account/info` - Get account information
- `GET /api/account/positions` - Get open positions
- `GET /api/account/deals` - Get deal history
- `GET /api/account/summary` - Get account summary

## 🛠️ Technology Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend

- **Express.js** - Web framework
- **MetaApi** - MT4 integration
- **JWT** - Authentication
- **Helmet.js** - Security headers
- **CORS** - Cross-origin support

## 🔐 Security Features

- JWT-based authentication
- Secure password hashing (bcrypt)
- Rate limiting
- CORS protection
- Security headers (Helmet.js)
- Environment variable protection
- Token expiration handling

## 📊 Dashboard Metrics

- **Account Balance** - Current account balance
- **Equity** - Current equity
- **Margin Level** - Margin usage percentage
- **Win Rate** - Trading success rate
- **Total Profit/Loss** - Cumulative P&L
- **Monthly Profit** - Last 30 days performance
- **Drawdown** - Maximum drawdown
- **Trade Statistics** - Win/loss counts

## 🎨 UI Components

- **Dashboard Cards** - Metric displays
- **Charts** - Win rate and profit visualization
- **Login Form** - Secure authentication
- **Sidebar** - Navigation with collapse
- **Data Tables** - Deal history display
- **Loading States** - Skeleton loaders
- **Error Handling** - User-friendly error messages

## 🔄 Development

### Frontend Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development

```bash
cd api-meta-trader-4
npm start            # Start server
npm run dev          # Start with nodemon
npm test             # Run tests
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**

   - Check MetaApi credentials in `.env`
   - Verify port 3001 is available
   - Check Node.js version (18+)

2. **Login fails**

   - Update credentials in `api-meta-trader-4/routes/auth.js`
   - Verify backend is running
   - Check browser console for errors

3. **No data displayed**

   - Ensure MetaApi account is deployed
   - Check backend logs
   - Verify investor account ID

4. **CORS errors**
   - Check `FRONTEND_URL` in backend `.env`
   - Verify frontend URL matches CORS origin

See [INTEGRATION.md](INTEGRATION.md) for detailed troubleshooting.

## 📝 Configuration

### Environment Variables

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:3001
```

**Backend (api-meta-trader-4/.env)**

```env
METAAPI_TOKEN=your_token_here
JWT_SECRET=your_secret_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [MetaApi.cloud](https://metaapi.cloud/) - MT4 integration
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Recharts](https://recharts.org/) - Charting library
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📞 Support

For support, please:

- Check the [Integration Guide](INTEGRATION.md)
- Review [Backend Documentation](api-meta-trader-4/README.md)
- Open an issue on GitHub

---

**Built with ❤️ for traders**
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
