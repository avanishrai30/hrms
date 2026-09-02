# Production Auth Reconciliation

Use this runbook when the seeded tenant owner reaches password verification but production login returns `Invalid credentials.` Never print `BOOTSTRAP_PASSWORD`, access tokens, refresh tokens, or full password hashes.

## Non-Secret Environment Fingerprints

Run on the VPS from `/opt/vc-hrms`.

```bash
set -euo pipefail
HOST_FP="$(awk -F= '$1=="BOOTSTRAP_PASSWORD"{sub(/^BOOTSTRAP_PASSWORD=/,""); gsub(/^"|"$/,""); print}' .env | shasum -a 256 | awk '{print $1}')"
CONTAINER_FP="$(docker compose run --rm --no-deps api node -e 'const crypto=require("crypto"); const value=process.env.BOOTSTRAP_PASSWORD || ""; process.stdout.write(crypto.createHash("sha256").update(value).digest("hex"))')"
test "$HOST_FP" = "$CONTAINER_FP" && echo "bootstrapPasswordFingerprintMatches=true" || echo "bootstrapPasswordFingerprintMatches=false"
```

If the fingerprints differ, inspect Docker Compose environment interpolation and `.env` key names before reseeding.

## Stored Hash Verification

Run this one-off check in an ephemeral API container. It reports booleans only.

```bash
docker compose run --rm api node --input-type=module - <<'NODE'
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const tenant = await prisma.tenant.findUnique({ where: { slug: "vc-organics" } });
const user = await prisma.user.findUnique({ where: { email: "owner@vcorganics.com" } });
const membership = tenant && user
  ? await prisma.tenantMembership.findUnique({ where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } } })
  : null;
const passwordMatches = Boolean(user?.passwordHash && process.env.BOOTSTRAP_PASSWORD && await argon2.verify(user.passwordHash, process.env.BOOTSTRAP_PASSWORD));

console.log(JSON.stringify({
  tenantFound: Boolean(tenant),
  tenantActive: tenant?.status === "ACTIVE",
  userFound: Boolean(user),
  userActive: user?.status === "ACTIVE",
  membershipFound: Boolean(membership),
  membershipActive: membership?.status === "ACTIVE",
  passwordMatches
}, null, 2));

await prisma.$disconnect();
NODE
```

## Reconcile With Existing Seed

If `passwordMatches=false`, rerun the idempotent seed with the existing VPS `.env` injected by Docker Compose:

```bash
docker compose run --rm api npx tsx prisma/seed.ts
```

Repeat the stored hash verification. If the seed succeeds but `passwordMatches` remains false, compare the non-secret fingerprints and confirm the container `DATABASE_URL` points at the same production database before changing implementation.

## Direct Production Login Check

After `passwordMatches=true`, test the production auth endpoint from the VPS without echoing the password or enabling verbose curl:

```bash
docker compose run --rm --no-deps api node --input-type=module - <<'NODE'
const response = await fetch("https://api-hrms.vcorganics.com/api/v1/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    tenantSlug: "vc-organics",
    identifier: "owner@vcorganics.com",
    password: process.env.BOOTSTRAP_PASSWORD,
    deviceFingerprint: "vps-production-auth-check"
  })
});
console.log(JSON.stringify({
  status: response.status,
  ok: response.ok,
  setCookiePresent: response.headers.has("set-cookie")
}, null, 2));
NODE
```

Do not print response bodies from successful login checks because they contain tokens.
