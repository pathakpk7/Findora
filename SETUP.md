# Findora - Setup Guide

## Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Docker and Docker Compose (optional, for containerized deployment)
- Supabase account (for database)

## 1. Initial Setup Commands

### Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd findora

# Install root dependencies
npm install

# Install frontend dependencies
cd apps/frontend
npm install
cd ../..

# Install backend dependencies
cd apps/backend
npm install
cd ../..

# Install shared packages dependencies
cd packages/types
npm install
cd ../..
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Fill in your environment variables
# You'll need:
# - Supabase URL and keys
# - Database URL
# - JWT secret
```

## 2. Database Setup

### Supabase Configuration
1. Create a new Supabase project
2. Get your Supabase URL and anon key
3. Go to Settings > Database to get the connection string
4. Update your `.env` file with these values

### Prisma Setup
```bash
# Navigate to backend directory
cd apps/backend

# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# For production migrations
npm run db:migrate

# Open Prisma Studio (optional)
npm run db:studio
```

## 3. Development Setup

### Start Development Servers
```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

### Available Scripts
```bash
# Development
npm run dev              # Start both services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Building
npm run build            # Build both services
npm run build:frontend   # Frontend only
npm run build:backend    # Backend only

# Production
npm run start            # Start both in production
npm run start:frontend   # Frontend production
npm run start:backend    # Backend production

# Code Quality
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Database
npm run db:generate      # Generate Prisma client
npm run db:push         # Push schema to DB
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio
```

## 4. Docker Setup

### Using Docker Compose
```bash
# Build and start all services
npm run docker:up

# Stop all services
npm run docker:down

# Build images only
npm run docker:build
```

### Manual Docker Commands
```bash
# Build frontend
docker build -t findora-frontend ./apps/frontend

# Build backend
docker build -t findora-backend ./apps/backend

# Run with docker-compose
docker-compose up -d
```

## 5. Project Structure

```
findora/
├── apps/
│   ├── frontend/                 # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── lib/           # Utilities and helpers
│   │   │   └── hooks/         # Custom React hooks
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   └── Dockerfile
│   │
│   └── backend/                  # NestJS backend
│       ├── src/
│       │   ├── auth/           # Authentication module
│       │   ├── users/          # Users module
│       │   ├── config/         # Configuration files
│       │   └── common/         # Common utilities
│       ├── prisma/
│       │   └── schema.prisma   # Database schema
│       ├── package.json
│       └── Dockerfile
│
├── packages/
│   ├── types/                   # Shared TypeScript types
│   └── ui/                      # Shared UI components (future)
│
├── docker-compose.yml            # Docker configuration
├── package.json                 # Root package with workspaces
├── tsconfig.json               # Root TypeScript config
└── README.md                   # Project documentation
```

## 6. Best Practices

### Code Organization
- Use absolute imports (`@/` for app-specific, `@findora/` for shared)
- Keep components small and focused
- Follow TypeScript strict mode
- Use environment variables for configuration

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Different environments: `.env.development`, `.env.production`

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration-name

# Reset database (development only)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

## 7. API Documentation

When running in development mode:
- Swagger UI: http://localhost:3001/api/docs
- Health check: http://localhost:3001/api/health

## 8. Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` or `docker-compose.yml`
2. **Database connection**: Verify Supabase credentials
3. **TypeScript errors**: Run `npm run type-check`
4. **Build failures**: Clear node_modules and reinstall

### Reset Development Environment
```bash
# Clean all node_modules
npm run clean

# Reinstall dependencies
npm install
cd apps/frontend && npm install && cd ../..
cd apps/backend && npm install && cd ../..
cd packages/types && npm install && cd ../..
```

## 9. Production Deployment

### Environment Setup
1. Set production environment variables
2. Configure domain and SSL
3. Set up database backups
4. Configure monitoring

### Deployment Commands
```bash
# Build for production
npm run build

# Start production servers
npm run start

# Or with Docker
npm run docker:up
```

## 10. Next Steps

After setup:
1. Explore the frontend at http://localhost:3000
2. Check API docs at http://localhost:3001/api/docs
3. Start building your features
4. Add authentication and user management
5. Implement your business logic

## Support

For issues:
1. Check this setup guide
2. Review logs in terminal
3. Check Docker logs if using containers
4. Verify environment variables
