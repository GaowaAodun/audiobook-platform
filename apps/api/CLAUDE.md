# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a **pnpm + Turborepo monorepo** rooted at `audiobook-platform/`. The `apps/api` directory (current working directory) is the NestJS backend service.

```
audiobook-platform/
├── apps/
│   ├── api/        ← NestJS REST API (this directory)
│   ├── web/        ← Web frontend
│   ├── mobile/     ← Mobile app
│   └── admin/      ← Admin panel
├── packages/
│   ├── shared/     ← Shared types/utilities
│   └── ui/         ← Shared UI components
├── docker-compose.yml
└── turbo.json
```

## Commands

All commands should be run from `apps/api/` unless noted otherwise.

```bash
# Install deps (from monorepo root)
pnpm install

# Development
pnpm run start:dev        # Watch mode
pnpm run start:debug      # Watch + debug

# Build & production
pnpm run build
pnpm run start:prod

# Lint & format
pnpm run lint             # ESLint --fix
pnpm run format           # Prettier

# Tests
pnpm run test             # Unit tests (jest)
pnpm run test:watch       # Watch mode
pnpm run test:cov         # Coverage
pnpm run test:e2e         # End-to-end (test/jest-e2e.json)

# Run a single test file
pnpm run test -- --testPathPattern=<file>

# Turborepo (from monorepo root)
pnpm run dev              # Start all apps in parallel
pnpm run build            # Build all apps in dependency order
```

## Infrastructure

Start local services before running the API:

```bash
docker-compose up -d      # PostgreSQL :5432, Redis :6379, MinIO :9000/:9001
```

The `.env` file already has matching defaults for local development.

## Tech Stack

- **Framework**: NestJS 10 (TypeScript, `src/` root, compiled to `dist/`)
- **Database**: PostgreSQL via **Prisma 7** — schema at `prisma/schema.prisma`, Prisma client generated to `generated/prisma/`, config in `prisma.config.ts`
- **Cache/Queue**: Redis via `ioredis`
- **Auth**: Passport.js with `passport-jwt` and `passport-local`; JWT tokens via `@nestjs/jwt`
- **File Storage**: MinIO (S3-compatible) for audiobook assets
- **API Docs**: `@nestjs/swagger` (Swagger UI)
- **Validation**: `class-validator` + `class-transformer` DTOs

## Architecture Patterns

NestJS feature modules are the primary organizational unit. Each domain (e.g., users, books, auth) should be a self-contained module in `src/<domain>/` containing:
- `<domain>.module.ts` — imports, providers, exports
- `<domain>.controller.ts` — route handlers, Swagger decorators
- `<domain>.service.ts` — business logic
- `<domain>.dto.ts` — validated request/response shapes
- `<domain>.spec.ts` — unit tests

Register new modules in `src/app.module.ts`.

## Prisma Workflow

```bash
# After editing prisma/schema.prisma:
npx prisma migrate dev --name <migration-name>  # create migration + apply
npx prisma generate                              # regenerate client

# Inspect DB
npx prisma studio
```

The Prisma client is not yet generated — `prisma/schema.prisma` has no models defined yet (data ingestion work in progress on branch `PBalageDon_DataIngestion`).

## Environment Variables

Key variables (all in `.env`, matched by `docker-compose.yml` defaults):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT signing |
| `MINIO_*` | Object storage for audio files |
| `PORT` | HTTP port (default 3000) |
