FROM node:22-slim AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# Build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/ ./
COPY packages/shared/ ./packages/shared/
COPY apps/frontend/ ./apps/frontend/
COPY turbo.json ./
RUN cd packages/shared && npx tsc
RUN cd apps/frontend && npm run build

# Runtime
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built frontend
COPY --from=build /app/apps/frontend/build ./build
COPY --from=build /app/apps/frontend/package.json ./package.json

# Copy node_modules (hoisted by npm workspaces)
COPY --from=build /app/node_modules ./node_modules

# Copy built shared package into node_modules
COPY --from=build /app/packages/shared/dist ./node_modules/@acs/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/@acs/shared/package.json

EXPOSE 3000
CMD ["node", "build/index.js"]
