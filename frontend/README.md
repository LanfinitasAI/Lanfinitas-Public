# Lanfinitas AI - Frontend

AI-powered 3D fashion design platform frontend built with React 18, TypeScript, and Vite.

## Tech Stack

- **React 18.2** - UI framework
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Start development server (http://localhost:3000)
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── store/          # Zustand stores
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── assets/         # Static assets
│   ├── App.tsx         # Root component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Public static files
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## Features

- **Pattern Generation**: AI-powered pattern creation from 3D models
- **Fabric Simulation**: Realistic fabric behavior and draping
- **Layout Optimization**: Efficient material usage optimization
- **Real-time Updates**: WebSocket integration for live updates
- **Type Safety**: Full TypeScript support with strict mode
- **Code Quality**: ESLint and Prettier configuration
- **Optimized Build**: Code splitting and lazy loading

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket server URL

## Development Guidelines

- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error boundaries
- Write accessible components
- Keep components small and focused
- Use path aliases (@/) for imports

## Phase 5.1.1 Status

✅ Project setup complete
- Vite build configuration
- TypeScript configuration
- Tailwind CSS setup
- ESLint and Prettier
- Environment variables
- Basic React structure

## License

Private - Lanfinitas AI Project
