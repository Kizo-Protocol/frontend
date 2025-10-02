# Kizo Protocol - Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

## Overview

The Kizo Protocol Frontend is a modern, high-performance web application built for the Kizo Prediction Market on Aptos. It provides an intuitive interface for users to create markets, place bets, claim winnings, and track their portfolio performance in real-time.

### Key Features

- **🔗 Wallet Integration**: Seamless Aptos wallet connection with `@aptos-labs/wallet-adapter-react`
- **⚡ Real-time Updates**: Live market data using TanStack Query for efficient state management
- **📊 Advanced Analytics**: Interactive charts and data visualization with Recharts and Lightweight Charts
- **🎨 Modern UI**: Beautiful, responsive design with Radix UI primitives and Tailwind CSS
- **🔐 Secure Authentication**: JWT-based auth with session management
- **🌐 API Proxy**: Built-in API rewrites for seamless backend integration
- **🎭 Theme Support**: Light/dark mode with `next-themes`
- **📱 Mobile Responsive**: Optimized experience across all device sizes
- **⚙️ Type-Safe**: Full TypeScript coverage for robust development

## Tech Stack

### Core Framework
- **Next.js 15.5.4** - React framework with App Router and Turbopack
- **React 19.1.1** - UI library with latest concurrent features
- **TypeScript 5.9.2** - Static type checking

### Blockchain Integration
- **@aptos-labs/ts-sdk** - Aptos TypeScript SDK for blockchain interactions
- **@aptos-labs/wallet-adapter-react** - Wallet connection and transaction signing

### State Management & Data Fetching
- **TanStack Query** - Server state management and caching
- **Zustand** - Lightweight client state management
- **React Hook Form** - Performant form state management

### UI & Styling
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Data Visualization
- **Recharts** - React charting library
- **Lightweight Charts** - TradingView-style charts

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **pnpm** - Fast, efficient package manager

## Prerequisites

- **Node.js**: 18.0 or higher
- **pnpm**: 10.17.1 or higher (recommended)
- **Aptos Wallet**: Petra, Martian, or any Aptos-compatible wallet

### Installing pnpm

```bash path=null start=null
npm install -g pnpm@10.17.1
```

## Installation

### 1. Clone the Repository

```bash path=null start=null
git clone <repository-url>
cd kizo/aptos/fe
```

### 2. Install Dependencies

```bash path=null start=null
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env path=null start=null
# App Configuration
NEXT_PUBLIC_APP_URL=

# Backend API
NEXT_PUBLIC_BACKEND_URL=

# Aptos Configuration
NEXT_PUBLIC_APTOS_NETWORK=
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Optional: Analytics, Monitoring, etc.
# NEXT_PUBLIC_GA_ID=your-ga-id
```

### 4. Start Development Server

```bash path=null start=null
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build production application |
| `pnpm build:netlify` | Build for Netlify deployment |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint with auto-fix |

## Project Structure

```
fe/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── markets/             # Market listing & details
│   │   ├── page.tsx
│   │   └── [slug]/          # Dynamic market pages
│   └── profile/             # User profile & portfolio
│       ├── page.tsx
│       └── _components/
├── components/               # Reusable UI components
│   ├── navbar.tsx
│   ├── app-sidebar.tsx
│   ├── wallet-auth-provider.tsx
│   ├── auth-middleware.tsx
│   └── providers.tsx
├── lib/                      # Utility functions
│   ├── aptos-contracts.ts   # Contract addresses & ABIs
│   ├── api.ts               # API client
│   ├── utils.ts             # Helper functions
│   ├── constants.ts         # App constants
│   └── error-handler.ts     # Error handling
├── hooks/                    # Custom React hooks
│   └── use-wallet-auth.ts   # Wallet authentication hook
├── types/                    # TypeScript type definitions
│   ├── market.ts            # Market types
│   ├── auth.ts              # Auth types
│   └── globals.d.ts
├── config/                   # Configuration files
│   └── site.ts              # Site metadata
├── public/                   # Static assets
├── next.config.ts           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Key Features Implementation

### 1. Wallet Connection

The app uses Aptos Wallet Adapter for seamless wallet integration:

```typescript path=null start=null
import { WalletAuthProvider } from '@/components/wallet-auth-provider';

// Supports multiple wallets: Petra, Martian, Pontem, etc.
```

### 2. Smart Contract Interactions

Contract functions are abstracted in `lib/aptos-contracts.ts`:

```typescript path=null start=null
// Create a market
PREDICTION_MARKET_FUNCTIONS.CREATE_MARKET

// Place a bet
PREDICTION_MARKET_FUNCTIONS.PLACE_BET

// Claim winnings
PREDICTION_MARKET_FUNCTIONS.CLAIM_WINNINGS
```

### 3. API Integration

API calls are proxied through Next.js rewrites for security:

```typescript path=null start=null
// All /api/* requests are forwarded to the backend
// Configured in next.config.ts
```

### 4. Real-time Data

TanStack Query manages server state with automatic caching and revalidation:

```typescript path=null start=null
import { useQuery } from '@tanstack/react-query';

const { data: markets } = useQuery({
  queryKey: ['markets'],
  queryFn: fetchMarkets,
  refetchInterval: 10000, // Auto-refresh every 10s
});
```

## Configuration

### Next.js Configuration

Key configuration in `next.config.ts`:

- **Webpack Polyfills**: Crypto and stream modules for browser compatibility
- **Image Optimization**: Configured for Cloudinary, Unsplash, and Pexels
- **API Rewrites**: Proxy `/api/*` to backend
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Performance**: CSS chunking, package import optimization

### Tailwind CSS

Tailwind v4 with CSS-first configuration provides:
- Custom color schemes
- Dark mode support
- Animation utilities
- Responsive design system

## Security Features

### Content Security Policy (CSP)

Production builds include strict CSP headers:

```typescript path=null start=null
"default-src 'self'"
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com"
"connect-src 'self' https: wss:"
```

### Additional Security

- **HSTS**: Enforced HTTPS in production
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer Policy**: Strict origin policy
- **Auth Cookie Security**: HttpOnly, Secure, SameSite flags

## Development

### Running Tests

```bash path=null start=null
pnpm test
```

### Code Quality

```bash path=null start=null
# Lint and fix
pnpm lint

# Type check
pnpm type-check

# Format code
pnpx prettier --write .
```

### Building for Production

```bash path=null start=null
pnpm build
pnpm start
```

## Deployment

### Netlify

The project includes a dedicated Netlify build script:

```bash path=null start=null
pnpm build:netlify
```

### Vercel

```bash path=null start=null
vercel deploy
```

### Docker

Create a `Dockerfile`:

```dockerfile path=null start=null
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment Variables

Ensure all required environment variables are set:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_APTOS_NETWORK`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

## Smart Contract Integration

### Contract Address

```typescript path=null start=null
export const KIZO_CONTRACT_ADDRESS = 
  "0x66c4ec614f237de2470e107a17329e17d2e9d04bd6f609bdb7f7b52ae24c957c";
```

### Available Functions

| Function | Description |
|----------|-------------|
| `create_market` | Create a new prediction market |
| `place_bet` | Place a bet on a market outcome |
| `resolve_market` | Resolve market with outcome |
| `claim_winnings` | Claim winnings from won bets |
| `withdraw_protocol_fees` | Admin: withdraw protocol fees |
| `update_protocol_fee` | Admin: update fee percentage |
| `pause/unpause` | Admin: pause/unpause protocol |

### Coin Types

```typescript path=null start=null
APT: "0x1::aptos_coin::AptosCoin"
```

## Troubleshooting

### Wallet Connection Issues

**Problem**: Wallet not connecting

**Solutions**:
1. Ensure wallet extension is installed and unlocked
2. Check network matches (testnet/mainnet)
3. Clear browser cache and reconnect
4. Try a different wallet provider

### Build Errors

**Problem**: Module not found errors

**Solutions**:
```bash path=null start=null
rm -rf node_modules .next
pnpm install
pnpm dev
```

### API Connection Issues

**Problem**: API requests failing

**Solutions**:
1. Verify `NEXT_PUBLIC_BACKEND_URL` is correct
2. Check backend server is running
3. Review CORS settings
4. Check browser console for errors

### Performance Issues

**Problem**: Slow page loads

**Solutions**:
1. Enable Next.js production mode: `pnpm build && pnpm start`
2. Optimize images with Next.js Image component
3. Implement lazy loading for heavy components
4. Check network tab for slow API calls

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

## Performance Optimizations

- **Turbopack**: Fast development builds
- **Image Optimization**: Automatic WebP conversion
- **Code Splitting**: Automatic route-based splitting
- **Package Optimization**: Selective imports for Radix UI and Lucide
- **CSS Chunking**: Strict CSS chunking strategy
- **On-Demand Entries**: Limited page buffer for dev mode

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting: `pnpm lint`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- Follow the existing code style
- Use TypeScript for all new code
- Add comments for complex logic
- Update tests as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Support

For questions, issues, or contributions:

- **Issues**: Open an issue on GitHub
- **Documentation**: [Kizo Protocol Docs](https://kizoprotocol.gitbook.io/kizoprotocol-docs)
- **Community**: [Kizo Protocol X](https://x.com/kizoprotocol)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) by Vercel
- UI components from [Radix UI](https://www.radix-ui.com/)
- Powered by [Aptos Labs](https://aptoslabs.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Last Updated**: October 1, 2025  
**Version**: 0.1.0  
**Status**: Active Development  
**Network**: Aptos Testnet
# CI/CD Fix Applied - Thu Oct  2 10:18:58 WIB 2025
[INFO] : Testing professional CI/CD pipeline - Thu Oct  2 10:54:13 WIB 2025
