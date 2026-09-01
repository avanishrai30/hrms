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
# Build the API together with all of its workspace dependencies so runtime
# package exports resolve to compiled JavaScript rather than TypeScript source.
RUN pnpm --filter @vc-wms/api... build
# Fail the image build immediately if the production runtime artifacts are absent.
RUN test -f apps/api/dist/apps/api/src/main.js \
 && test -f packages/auth/dist/index.js \
 && test -f packages/shared-types/dist/index.js \
 && test -f packages/utils/dist/index.js

FROM node:20-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV PORT=4000
RUN corepack enable && apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
