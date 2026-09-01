FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @vc-wms/api prisma:generate
RUN pnpm --filter @vc-wms/api build

FROM node:20-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV PORT=4000
RUN corepack enable && apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000
CMD ["apps/api/node_modules/.bin/tsx", "apps/api/src/main.ts"]
