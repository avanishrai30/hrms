import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const QA_BASE_URL = process.env.QA_BASE_URL ?? "https://hrms.vcorganics.com";
const ARTIFACT_DIR =
  process.env.QA_ARTIFACT_DIR ??
  "/Users/avanish/.gemini/antigravity/brain/36d1acc3-4fd0-4587-82f0-7fe302242ec4/screenshots";
const QA_STORAGE_STATE = process.env.QA_STORAGE_STATE;

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function getQaCredentials() {
  if (QA_STORAGE_STATE) return null;
  const email = process.env.QA_EMAIL;
  const password = process.env.QA_PASSWORD;
  if (!email || !password) {
    console.error("QA credentials are required through QA_EMAIL and QA_PASSWORD, or provide QA_STORAGE_STATE.");
    process.exit(1);
  }
  return { email, password };
}

async function authenticate(page) {
  if (QA_STORAGE_STATE) return;
  const creds = getQaCredentials();
  console.log("1. Authenticating with externally supplied QA credentials...");
  await page.goto(`${QA_BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill("#identifier", creds.email);
  await page.fill("#password", creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 30000 });
  console.log("   Authenticated successfully. Current URL:", page.url());
}

async function verifyRoute(page, route, marker, screenshotName) {
  try {
    const response = await page.goto(`${QA_BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(1200);
    const content = (await page.textContent("body")) ?? "";
    const hasCrash =
      content.includes("Application error") ||
      content.includes("Cannot read properties of undefined") ||
      content.includes("Page not found");
    if (screenshotName) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshotName) });
    }
    return response && response.status() < 400 && !hasCrash && (!marker || content.includes(marker))
      ? "PASS"
      : `FAIL (${response?.status() ?? 0})`;
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

async function verifyFoundationLive() {
  console.log("============================================================");
  console.log("HRMS FOUNDATION & TENANT INTELLIGENCE LIVE VERIFICATION");
  console.log("============================================================\n");
  console.log(`Target: ${QA_BASE_URL}`);
  console.log("Credentials source: externally supplied environment/session state\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(QA_STORAGE_STATE ? { storageState: QA_STORAGE_STATE } : {})
  });
  const page = await context.newPage();
  const results = {};

  await authenticate(page);

  results.analytics = await verifyRoute(page, "/analytics", null, "live-analytics.png");
  results.adminSecurity = await verifyRoute(page, "/admin/security", "Security", "live-admin-security.png");
  results.attendance = await verifyRoute(page, "/attendance", null, "live-attendance.png");
  results.businessContext = await verifyRoute(page, "/admin/business-context", "Business", "live-business-context.png");
  results.payrollRun = await verifyRoute(page, "/payroll/run", "Payroll", "live-payroll-run.png");
  results.documents = await verifyRoute(page, "/documents", null, "live-documents.png");
  results.profile = await verifyRoute(page, "/profile", null, "live-profile.png");
  results.users = await verifyRoute(page, "/users", null, "live-users.png");
  results.ai = await verifyRoute(page, "/ai", null, "live-ai.png");
  results.idCard = await verifyRoute(page, "/id-card", null, "live-id-card.png");

  await browser.close();

  console.log("\n============================================================");
  console.log("LIVE VERIFICATION SUMMARY");
  console.log("============================================================");
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync(path.join(ARTIFACT_DIR, "live-verification-summary.json"), JSON.stringify(results, null, 2));
}

verifyFoundationLive().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
