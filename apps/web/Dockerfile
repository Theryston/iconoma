# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

# IMPORTANT: Node.js Version Maintenance
# This Dockerfile uses Node.js 24.13.0-slim.
# To ensure security and compatibility, regularly update the NODE_VERSION ARG.
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS dependencies

# Set working directory
WORKDIR /app

# The build context is the repository root (see fly.toml). Copy the workspace
# manifests needed by pnpm without trying to escape the Docker context.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/studio/package.json packages/studio/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

# Install project dependencies with frozen lockfile for reproducible builds
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && pnpm install --frozen-lockfile --filter web...


# ============================================
# Stage 2: Build Next.js application
# ============================================

FROM node:${NODE_VERSION} AS builder

# Set working directory
WORKDIR /app

# Copy project dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=dependencies /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy application source code
COPY . .

ENV NODE_ENV=production

# Next.js collects completely anonymous telemetry data about general usage.
# Uncomment to disable telemetry during build:
# ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application from the app directory.
WORKDIR /app/apps/web
RUN corepack enable pnpm && pnpm build


# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

# Set working directory
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Uncomment to disable Next.js telemetry at runtime:
# ENV NEXT_TELEMETRY_DISABLED=1

# Copy the built monorepo. Running `next start` from the web workspace avoids
# depending on the location Next.js chooses for standalone output in a pnpm
# monorepo.
COPY --from=builder --chown=node:node /app /app

# Switch to non-root user
USER node

# Expose Next.js port
EXPOSE 3000

# Start Next.js from the web workspace
CMD ["corepack", "pnpm", "--dir", "apps/web", "start"]
