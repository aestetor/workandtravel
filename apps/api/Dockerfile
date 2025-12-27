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
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --from=deps /root/.local/share/pnpm /root/.local/share/pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
EXPOSE 3001
CMD ["node", "apps/api/dist/src/main.js"]
