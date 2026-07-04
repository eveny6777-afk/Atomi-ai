# Atomic AI - Production-Ready AI SaaS Platform

A modern, scalable monorepo starter template built with Turborepo, Next.js, NestJS, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9.1.0+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/eveny6777-afk/Atomi-ai.git
cd Atomi-ai

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
cp prisma/.env.example prisma/.env.local
```

### Database Setup

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Push schema to database
pnpm db:push

# Seed database (optional)
pnpm db:seed
```

### Local Development

```bash
# Start all services in development mode
pnpm dev

# This will start:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - Prisma Studio: https://studio.prisma.io (after db:push)

# Open another terminal for Prisma Studio
pnpm db:studio
```

### Build for Production

```bash
# Build all packages and apps
pnpm build

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm type-check

# Format code
pnpm format
```

## 📦 Project Structure

```
Atomic-ai/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   └── components/
│   │   ├── public/
│   │   ├── .env.example
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── api/              # NestJS backend
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── main.ts
│       │   ├── health/   # Health check endpoint
│       │   └── prisma/   # Database service
│       ├── test/
│       ├── .env.example
│       ├── nest-cli.json
│       └── tsconfig.json
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared React components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── utils/            # Shared utility functions
│       ├── api-client.ts
│       ├── date.ts
│       └── string.ts
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Database seeding
│   └── .env.example
├── docker-compose.yml    # Development database
├── docker-compose.prod.yml # Production stack
├── turbo.json            # Turbo configuration
├── tsconfig.json         # Root TypeScript config
├── pnpm-workspace.yaml   # pnpm workspace
├── .eslintrc.json        # ESLint config
└── .prettierrc.json      # Prettier config
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React** - 18.3.1

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type safety
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Production database

### Monorepo
- **Turborepo** - Monorepo management
- **pnpm** - Fast package manager
- **TypeScript Paths** - Import aliases

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Docker** - Containerization

## 📝 Available Scripts

### Root Level

```bash
pnpm dev              # Start all services in dev mode
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm format           # Format all files with Prettier
pnpm type-check       # Check TypeScript types
pnpm clean            # Clean all build artifacts
pnpm db:push          # Sync Prisma schema with database
pnpm db:studio        # Open Prisma Studio
```

### Frontend (apps/web)

```bash
pnpm --filter @atomic-ai/web dev      # Start dev server
pnpm --filter @atomic-ai/web build    # Build for production
pnpm --filter @atomic-ai/web start    # Start production server
```

### Backend (apps/api)

```bash
pnpm --filter @atomic-ai/api dev      # Start dev server with hot reload
pnpm --filter @atomic-ai/api build    # Build for production
pnpm --filter @atomic-ai/api start    # Start production server
pnpm --filter @atomic-ai/api test     # Run tests
```

## 🐳 Docker

### Development

```bash
# Start PostgreSQL database
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Stop services
docker-compose down
```

### Production

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 🔐 Authentication

JWT authentication structure is prepared but not implemented. To enable:

1. Uncomment JWT guards in NestJS modules
2. Implement password hashing (bcrypt recommended)
3. Create login/register endpoints
4. Add JWT middleware to protected routes

## 📚 Database

### Schema

The database includes:
- **users** - User accounts
- **sessions** - User sessions (prepared for JWT)

### Migrations

```bash
# Create a new migration
pnpm --filter @atomic-ai/api prisma migrate dev --name "migration_name"

# Apply migrations
pnpm db:push

# View database
pnpm db:studio
```

## 🎯 Path Aliases

### Frontend
```typescript
import { Button } from '@/components/Button';
import { User } from '@atomic-ai/types';
import { classNames } from '@atomic-ai/utils';
```

### Backend
```typescript
import { User } from '@atomic-ai/types';
import { ApiClient } from '@atomic-ai/utils';
import { PrismaService } from 'src/prisma/prisma.service';
```

## 🚀 Deployment

### Environment Variables

Create `.env.production` files for each app:

**apps/web/.env.production**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**apps/api/.env.production**
```
DATABASE_URL=postgresql://user:password@host:5432/atomic_ai
JWT_SECRET=your-production-secret-key
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Platforms

- **Vercel** - Next.js frontend
- **Railway/Render** - NestJS backend
- **Supabase/Neon** - PostgreSQL database

## 🧪 Testing

### Running Tests

```bash
pnpm test                              # Run all tests
pnpm --filter @atomic-ai/api test     # API tests only
pnpm --filter @atomic-ai/api test:e2e # E2E tests only
pnpm --filter @atomic-ai/api test:cov # Coverage report
```

## 📖 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5432 | xargs kill -9  # Database
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify DATABASE_URL format
# postgresql://username:password@localhost:5432/database_name
```

### TypeScript Errors
```bash
# Rebuild dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm type-check
```

## 📄 License

MIT

## 👤 Author

Atomic AI Team

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.
