# Findora

Production-grade full-stack application built with Next.js, NestJS, and Supabase.

## Tech Stack

- **Frontend**: Next.js 15 App Router + TypeScript + TailwindCSS + ShadCN UI
- **Backend**: NestJS + TypeScript
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Deployment**: Docker-ready

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd findora
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

3. **Set up the database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start the development servers**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

## Project Structure

```
findora/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   └── backend/           # NestJS backend application
├── packages/              # Shared packages
│   ├── ui/               # Shared UI components
│   └── types/            # Shared TypeScript types
├── docker-compose.yml    # Docker configuration
├── package.json          # Root package.json with workspaces
└── README.md
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run start` - Start both applications in production mode
- `npm run lint` - Run linting for all applications
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema to Supabase
- `npm run docker:up` - Start services with Docker

## Environment Variables

See `.env.example` for all required environment variables.

## Docker

```bash
# Build and start all services
npm run docker:up

# Stop services
npm run docker:down
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
