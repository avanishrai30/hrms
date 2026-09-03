import { Logger } from "@nestjs/common";

export interface EnvAuditItem {
  key: string;
  status: "SET" | "MISSING" | "INVALID";
}

const REQUIRED_COMMON_KEYS = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const;

const REQUIRED_PROD_KEYS = ["REDIS_URL"] as const;

/**
 * Validates the runtime environment variables on startup.
 * Never prints secret values.
 * Fails fast by throwing an Error if any required variable is missing or invalid.
 */
export function validateEnvironment(): EnvAuditItem[] {
  const logger = new Logger("EnvValidator");
  const isProd = process.env.NODE_ENV === "production";
  const auditReport: EnvAuditItem[] = [];
  const errors: string[] = [];

  for (const key of REQUIRED_COMMON_KEYS) {
    const val = process.env[key];
    if (!val || val.trim().length === 0) {
      auditReport.push({ key, status: "MISSING" });
      errors.push(`Required environment variable '${key}' is MISSING.`);
    } else if (key.includes("SECRET") && val.trim().length < 16) {
      auditReport.push({ key, status: "INVALID" });
      errors.push(`Environment variable '${key}' is INVALID (must be at least 16 characters).`);
    } else {
      auditReport.push({ key, status: "SET" });
    }
  }

  if (isProd) {
    for (const key of REQUIRED_PROD_KEYS) {
      const val = process.env[key];
      if (!val || val.trim().length === 0) {
        auditReport.push({ key, status: "MISSING" });
        errors.push(`Required production environment variable '${key}' is MISSING.`);
      } else {
        auditReport.push({ key, status: "SET" });
      }
    }
  }

  if (errors.length > 0) {
    for (const err of errors) {
      logger.error(`[CONFIG FAILURE] ${err}`);
    }
    throw new Error(`Environment validation failed on startup:\n${errors.join("\n")}`);
  }

  logger.log(
    `[CONFIG AUDIT] Environment configuration verified successfully (${auditReport.length} keys validated, all SET).`
  );
  return auditReport;
}
