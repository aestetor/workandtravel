FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
RUN corepack enable
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps /app/apps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/api apps/api
ENV DATABASE_URL="postgresql://app:app@localhost:5432/worktravel?schema=public"
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api/package.json ./
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
