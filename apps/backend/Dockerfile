FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# Build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/ ./
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/
COPY turbo.json ./
RUN cd packages/shared && npx tsc
RUN cd apps/backend && npx prisma generate
RUN cd apps/backend && npx tsc

# Runtime
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built backend
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/apps/backend/package.json ./package.json

# Copy node_modules (hoisted by npm workspaces)
COPY --from=build /app/node_modules ./node_modules

# Copy built shared package into node_modules
COPY --from=build /app/packages/shared/dist ./node_modules/@acs/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/@acs/shared/package.json

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
