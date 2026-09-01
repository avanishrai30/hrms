import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = resolve(root, "apps/api");

const defaults = {
  NODE_ENV: "development",
  POSTGRES_DB: "vc_hrms_prod",
  POSTGRES_USER: "hrms_admin",
  POSTGRES_PASSWORD: "SuperSecretSecurePassword2026!",
  DATABASE_URL: "postgresql://hrms_admin:SuperSecretSecurePassword2026!@localhost:5432/vc_hrms_prod?schema=public",
  REDIS_PASSWORD: "RedisSecure2026!",
  REDIS_URL: "redis://:RedisSecure2026!@localhost:6379",
  JWT_ACCESS_SECRET: "local-dev-access-secret-change-before-production",
  JWT_REFRESH_SECRET: "local-dev-refresh-secret-change-before-production",
  JWT_SECRET: "local-dev-jwt-secret-change-before-production",
  COOKIE_SECRET: "local-dev-cookie-secret-change-before-production",
  CSRF_SECRET: "local-dev-csrf-secret-change-before-production",
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000/api/v1",
  NEXT_PUBLIC_API_URL: "http://localhost:4000/api/v1",
  NEXT_PUBLIC_APP_NAME: "VC-WMS",
  NEXT_PUBLIC_DEFAULT_TENANT_SLUG: "vc-organics",
  TENANT_DOMAIN_ROOT: "localhost",
  BOOTSTRAP_PASSWORD: "ChangeMe123!",
  VC_ORGANICS_OWNER_EMAIL: "owner@vcorganics.com",
  PLATFORM_ADMIN_EMAILS: "admin@example.com",
  GEMINI_API_KEY: "",
  OPENAI_API_KEY: ""
};

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...defaults },
    ...options
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function commandWorks(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "ignore",
    env: { ...process.env, ...defaults }
  });
  return result.status === 0;
}

function ensureEnvFile(path) {
  mkdirSync(dirname(path), { recursive: true });
  let existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const present = new Set(
    existing
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => line.slice(0, line.indexOf("=")))
  );

  const additions = Object.entries(defaults)
    .filter(([key]) => !present.has(key))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`);

  if (!existing.trim()) {
    existing = "# Auto-generated local development environment\n";
  }
  if (additions.length) {
    existing = `${existing.trimEnd()}\n${additions.join("\n")}\n`;
    writeFileSync(path, existing, "utf8");
  }
}

console.log("\nVC-WMS local setup\n");

ensureEnvFile(resolve(root, ".env"));
ensureEnvFile(resolve(apiDir, ".env"));
console.log("✓ Local environment files are ready");

if (!commandWorks("docker", ["--version"])) {
  throw new Error("Docker CLI is not installed. Install Docker Desktop and rerun pnpm setup:local.");
}

if (!commandWorks("docker", ["info"])) {
  if (process.platform === "darwin") {
    console.log("Starting Docker Desktop...");
    spawnSync("open", ["-a", "Docker"], { stdio: "ignore" });
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (commandWorks("docker", ["info"])) {
        ready = true;
        break;
      }
      sleep(2000);
    }
    if (!ready) {
      throw new Error("Docker Desktop did not become ready. Open Docker Desktop once and rerun pnpm setup:local.");
    }
  } else {
    throw new Error("Docker daemon is not running. Start Docker and rerun pnpm setup:local.");
  }
}

console.log("✓ Docker engine is running");
run("docker", ["compose", "up", "-d", "postgres", "redis"]);
console.log("✓ PostgreSQL and Redis are starting");

for (let attempt = 0; attempt < 30; attempt += 1) {
  if (commandWorks("docker", ["exec", "hrms-postgres", "pg_isready", "-U", defaults.POSTGRES_USER, "-d", defaults.POSTGRES_DB])) {
    break;
  }
  if (attempt === 29) throw new Error("PostgreSQL did not become ready in time.");
  sleep(2000);
}
console.log("✓ PostgreSQL is ready");

run("pnpm", ["prisma:generate"]);
run("pnpm", ["--filter", "@vc-wms/api", "exec", "prisma", "db", "push"]);
run("pnpm", ["db:seed"]);

console.log(`
✓ VC-WMS local database is ready

Login:
  Tenant slug: vc-organics
  Email:       ${defaults.VC_ORGANICS_OWNER_EMAIL}
  Password:    ${defaults.BOOTSTRAP_PASSWORD}

Start the application with:
  pnpm dev:api
  pnpm dev:web
`);
