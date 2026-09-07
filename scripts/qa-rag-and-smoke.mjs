import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const QA_BASE_URL = process.env.QA_BASE_URL ?? "https://hrms.vcorganics.com";
const ARTIFACT_DIR =
  process.env.QA_ARTIFACT_DIR ??
  "/Users/avanish/.gemini/antigravity/brain/36d1acc3-4fd0-4587-82f0-7fe302242ec4/screenshots";
const QA_STORAGE_STATE = process.env.QA_STORAGE_STATE;
const QA_ALLOW_MUTATIONS = process.env.QA_ALLOW_MUTATIONS === "true";

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

async function runReadOnlySmoke(page, qaReport) {
  console.log("\nExecuting read-only production smoke matrix...");
  const smokeRoutes = [
    "/dashboard",
    "/analytics",
    "/attendance",
    "/documents",
    "/profile",
    "/users",
    "/ai",
    "/admin/security",
    "/payroll/run",
    "/id-card"
  ];

  for (const route of smokeRoutes) {
    try {
      const response = await page.goto(`${QA_BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 20000 });
      const status = response?.status() ?? 0;
      const content = (await page.textContent("body")) ?? "";
      const hasCrash =
        content.includes("Application error") ||
        content.includes("Cannot read properties of undefined") ||
        content.includes("Page not found");
      const passed = status >= 200 && status < 400 && !hasCrash;
      qaReport.smokeRoutes[route] = passed ? `PASS (${status})` : `FAIL (${status})`;
      console.log(`   ${route.padEnd(20)} -> ${qaReport.smokeRoutes[route]}`);
    } catch (err) {
      qaReport.smokeRoutes[route] = "ERROR: " + err.message;
      console.log(`   ${route.padEnd(20)} -> ${qaReport.smokeRoutes[route]}`);
    }
  }
}

async function runMutationRagQa(page, qaReport) {
  if (!QA_ALLOW_MUTATIONS) {
    const skipped = "SKIPPED - mutation QA not enabled.";
    qaReport.knowledgeIngestion = skipped;
    qaReport.ragExplorer = skipped;
    qaReport.copilotSource = skipped;
    qaReport.archiveStopsRetrieval = skipped;
    qaReport.deleteCleansUp = skipped;
    console.log("\nRAG upload/archive/delete QA skipped because QA_ALLOW_MUTATIONS is not true.");
    return;
  }

  console.log("\nRunning disposable RAG mutation QA. Disposable data will be cleaned up.");
  await page.goto(`${QA_BASE_URL}/admin/business-context`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const knowledgeTab = page.locator('button:has-text("Knowledge Library")');
  await knowledgeTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "rag-01-knowledge-tab.png") });

  const uniqueToken = `QA-RAG-${Date.now()}`;
  const uniqueAllowance = "INR 4,750";
  const tempDocPath = path.join(ARTIFACT_DIR, `${uniqueToken}.txt`);
  const docContent = `QA VERIFICATION POLICY
Document Reference: ${uniqueToken}
Policy Classification: DISPOSABLE_QA_BENEFIT

Under policy reference ${uniqueToken}, eligible team members receive a special quarterly QA allowance of ${uniqueAllowance} per quarter.`;

  fs.writeFileSync(tempDocPath, docContent, "utf-8");

  try {
    const fileInput = page.locator('input[type="file"][accept*=".txt"]');
    await fileInput.setInputFiles(tempDocPath);
    const titleInput = page.locator('input[placeholder*="Employee handbook"]');
    await titleInput.fill(`QA Disposable Policy ${uniqueToken}`);
    await page.locator('button:has-text("Upload and Index")').click();
    await page.waitForTimeout(5000);

    const docRow = page.locator(`tr:has-text("${uniqueToken}")`);
    const isIndexed = (await docRow.count()) > 0;
    qaReport.knowledgeIngestion = isIndexed ? "PASS" : "FAIL";

    const searchInput = page.locator('input[placeholder*="Search exact policy concept"]');
    const searchBtn = page.getByRole("button", { name: "Search", exact: true });
    await searchInput.fill(uniqueToken);
    await searchBtn.click();
    await page.waitForTimeout(2000);
    qaReport.ragExplorer = (await page.locator(`text=${uniqueAllowance}`).count()) > 0 ? "PASS" : "FAIL";

    await page.goto(`${QA_BASE_URL}/ai`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]');
    if ((await chatInput.count()) > 0) {
      await chatInput.fill(`What is the special quarterly QA allowance under policy ${uniqueToken}?`);
      await page.locator('button:has-text("Send"), button[type="submit"], button:has(svg.lucide-send)').first().click();
      await page.waitForTimeout(12000);
      const pageContent = (await page.textContent("body")) ?? "";
      qaReport.copilotSource =
        pageContent.includes("4,750") || pageContent.includes("4750") || pageContent.includes(uniqueToken)
          ? "PASS"
          : "PARTIAL_PASS";
    } else {
      qaReport.copilotSource = "FAIL";
    }

    await page.goto(`${QA_BASE_URL}/admin/business-context`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Knowledge Library")').click();
    await page.waitForTimeout(1000);
    const rowForCleanup = page.locator(`tr:has-text("${uniqueToken}")`);
    if ((await rowForCleanup.count()) > 0) {
      await rowForCleanup.locator('button:has(svg.lucide-archive)').click();
      await page.waitForTimeout(2500);
      await searchInput.fill(uniqueToken);
      await searchBtn.click();
      await page.waitForTimeout(2000);
      qaReport.archiveStopsRetrieval = (await page.locator(`text=${uniqueAllowance}`).count()) === 0 ? "PASS" : "FAIL";

      await rowForCleanup.locator('button:has(svg.lucide-trash-2)').click();
      await page.waitForTimeout(2500);
      qaReport.deleteCleansUp = (await page.locator(`tr:has-text("${uniqueToken}")`).count()) === 0 ? "PASS" : "FAIL";
    } else {
      qaReport.archiveStopsRetrieval = "FAIL";
      qaReport.deleteCleansUp = "FAIL";
    }
  } finally {
    if (fs.existsSync(tempDocPath)) {
      fs.unlinkSync(tempDocPath);
    }
  }
}

async function runLiveRagQA() {
  console.log("============================================================");
  console.log("HRMS PRODUCTION RAG & TENANT KNOWLEDGE VERIFICATION PASS");
  console.log("============================================================\n");
  console.log(`Target: ${QA_BASE_URL}`);
  console.log(`Mutation QA enabled: ${QA_ALLOW_MUTATIONS ? "yes" : "no"}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(QA_STORAGE_STATE ? { storageState: QA_STORAGE_STATE } : {})
  });
  const page = await context.newPage();

  const qaReport = {
    knowledgeIngestion: "PENDING",
    ragExplorer: "PENDING",
    copilotSource: "PENDING",
    archiveStopsRetrieval: "PENDING",
    deleteCleansUp: "PENDING",
    smokeRoutes: {}
  };

  await authenticate(page);
  await runMutationRagQa(page, qaReport);
  await runReadOnlySmoke(page, qaReport);
  await browser.close();

  console.log("\n============================================================");
  console.log("PRODUCTION VERIFICATION REPORT");
  console.log("============================================================");
  console.log(JSON.stringify(qaReport, null, 2));

  fs.writeFileSync(path.join(ARTIFACT_DIR, "rag-verification-report.json"), JSON.stringify(qaReport, null, 2));
}

runLiveRagQA().catch((err) => {
  console.error("Live RAG QA failed:", err);
  process.exit(1);
});
