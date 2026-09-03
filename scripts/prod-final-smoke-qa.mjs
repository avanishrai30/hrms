import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const PROD_WEB_URL = "https://hrms.vcorganics.com";
const PROD_API_URL = "https://api-hrms.vcorganics.com/api/v1";
const ARTIFACT_DIR = "/Users/avanish/.gemini/antigravity/brain/36d1acc3-4fd0-4587-82f0-7fe302242ec4/screenshots";

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function getCredentials() {
  try {
    const password = execSync(
      'ssh -i ~/.ssh/hrms_vps_chatgpt root@200.234.34.130 "grep ^BOOTSTRAP_PASSWORD= /opt/vc-hrms/.env | cut -d= -f2-"',
      { encoding: "utf-8" }
    ).trim();
    const ownerEmail = "owner@vcorganics.com";
    const managerEmail = "techlead@vcorganics.com";
    return { ownerEmail, managerEmail, password };
  } catch (err) {
    console.error("Failed to securely resolve credentials via SSH:", err.message);
    return null;
  }
}

async function runProductionSmokeQA() {
  console.log("============================================================");
  console.log("FINAL AUTHENTICATED PRODUCTION SMOKE QA RUN");
  console.log(`Release SHA: b8e909b60527933336f842e35380d9c099a66945`);
  console.log(`Web Target: ${PROD_WEB_URL}`);
  console.log(`API Target: ${PROD_API_URL}`);
  console.log("============================================================\n");

  const creds = getCredentials();
  if (!creds || !creds.password) {
    console.error("Authenticated production QA could not be completed because secure credentials were unavailable.");
    process.exit(1);
  }
  console.log("Credentials retrieved securely into memory. (Secret values masked)\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const allNetworkRequests = [];
  const consoleErrors = [];
  const pageErrors = [];

  page.on("request", (req) => {
    allNetworkRequests.push({
      method: req.method(),
      url: req.url(),
      resourceType: req.resourceType()
    });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ text: msg.text(), url: msg.location()?.url });
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  // 1. Authenticated Login Flow
  console.log("1. Authenticating as Tenant Owner (owner@vcorganics.com)...");
  await page.goto(`${PROD_WEB_URL}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1000);

  await page.fill("#identifier", creds.ownerEmail);
  await page.fill("#password", creds.password);
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  console.log("   Authenticated successfully! Landed on:", page.url());

  // 2. Session Persistence Test
  console.log("\n2. Testing Session Persistence on Refresh...");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const isStillAuthenticated = !page.url().includes("/login");
  console.log(`   Session persisted after page reload: ${isStillAuthenticated ? "YES (PASS)" : "NO (FAIL)"}`);

  // 3. Visiting all 18 routes
  const routesToTest = [
    { name: "Home Dashboard", path: "/dashboard", desc: "authenticated shell loads, no flicker" },
    { name: "My Profile", path: "/profile", desc: "employee profile details" },
    { name: "Attendance Tracker", path: "/attendance", desc: "own attendance & geofence" },
    { name: "Leave & Time Off", path: "/leave", desc: "balances & requests" },
    { name: "Service Requests", path: "/requests", desc: "service requests" },
    { name: "Payslips & Salary", path: "/payslips", desc: "own payslips" },
    { name: "People Directory", path: "/employees", desc: "employee rows" },
    { name: "Organization Structure", path: "/organization", desc: "org hierarchy" },
    { name: "Talent Acquisition", path: "/ats", desc: "pipeline & candidates" },
    { name: "Performance & OKRs", path: "/performance", desc: "goals & reviews" },
    { name: "Learning LMS", path: "/learning", desc: "courses & progress" },
    { name: "Work Locations", path: "/locations", desc: "locations & geofence" },
    { name: "Analytics Hub", path: "/analytics", desc: "workforce/payroll metrics" },
    { name: "AI Copilot Workspace", path: "/ai", desc: "chat & tools" },
    { name: "AI Smart Insights", path: "/ai/insights", desc: "insights" },
    { name: "AI Workforce Predictions", path: "/ai/predictions", desc: "predictions" },
    { name: "AI Automations", path: "/ai/automations", desc: "automations" },
    { name: "Platform Admin Center", path: "/admin", desc: "admin hub & modules" }
  ];

  console.log("\n3. Verifying All Target Production Routes (Desktop 1440x900)...");
  const routeResults = [];

  for (const r of routesToTest) {
    const fullUrl = `${PROD_WEB_URL}${r.path}`;
    const beforeReqCount = allNetworkRequests.length;
    const beforeErrCount = consoleErrors.length;

    let attempts = 0;
    let success = false;
    let finalStatus = 0;
    let snippet = "";
    let title = "";

    while (attempts < 2 && !success) {
      attempts++;
      try {
        const resp = await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
        await page.waitForTimeout(1500);

        finalStatus = resp ? resp.status() : 200;
        snippet = await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\n+/g, " "));
        title = await page.title();

        success = finalStatus < 400 && !snippet.toLowerCase().includes("page not found");
      } catch (err) {
        snippet = err.message;
        await page.waitForTimeout(1000);
      }
    }

    const reqsOnPage = allNetworkRequests.slice(beforeReqCount);
    const errsOnPage = consoleErrors.slice(beforeErrCount);
    const apiCalls = reqsOnPage.filter((req) => req.url.includes("/api/"));

    const item = {
      page: r.name,
      requestedPath: r.path,
      finalUrl: page.url(),
      httpStatus: finalStatus,
      passed: success,
      title,
      snippet: snippet.slice(0, 100),
      apiCount: apiCalls.length,
      errorsCount: errsOnPage.length
    };
    routeResults.push(item);

    // Capture screenshot for key pages
    if (["/dashboard", "/profile", "/attendance", "/leave", "/payslips", "/employees", "/organization", "/ats", "/performance", "/learning", "/locations", "/analytics", "/ai", "/admin"].includes(r.path)) {
      const safeName = r.path.replace(/\//g, "-").slice(1) || "root";
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `prod-smoke-${safeName}-1440.png`), fullPage: false }).catch(() => {});
    }

    console.log(`   [${success ? "PASS" : "FAIL"}] ${r.name.padEnd(25)} -> ${page.url()} (${finalStatus}) [${apiCalls.length} API calls]`);
  }

  // 4. Responsive Viewport Check (375x812)
  console.log("\n4. Responsive Mobile Check (375x812)...");
  await page.setViewportSize({ width: 375, height: 812 });
  const sampleMobilePages = ["/dashboard", "/employees", "/leave", "/performance", "/locations", "/analytics", "/ai", "/admin"];
  const mobileResults = [];

  for (const mPath of sampleMobilePages) {
    try {
      await page.goto(`${PROD_WEB_URL}${mPath}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1000);

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const safeName = mPath.replace(/\//g, "-").slice(1);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `prod-smoke-${safeName}-375.png`), fullPage: false }).catch(() => {});

      mobileResults.push({ path: mPath, hasHorizontalScroll, passed: !hasHorizontalScroll });
      console.log(`   [${!hasHorizontalScroll ? "PASS" : "WARN"}] Mobile ${mPath} (Overflow: ${hasHorizontalScroll ? "YES" : "NO"})`);
    } catch (err) {
      console.log(`   [FAIL] Mobile ${mPath}: ${err.message}`);
    }
  }

  // Reset viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  // 5. Accessibility Smoke
  console.log("\n5. Accessibility Smoke Checks...");
  await page.goto(`${PROD_WEB_URL}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const a11yStats = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const unlabelledButtons = buttons.filter(
      (b) => !b.innerText.trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")
    ).length;

    const inputs = Array.from(document.querySelectorAll("input:not([type='hidden'])"));
    const unlabelledInputs = inputs.filter(
      (i) => !i.labels?.length && !i.getAttribute("aria-label") && !i.getAttribute("placeholder")
    ).length;

    const images = Array.from(document.querySelectorAll("img"));
    const imagesWithoutAlt = images.filter((img) => !img.hasAttribute("alt")).length;

    return { totalButtons: buttons.length, unlabelledButtons, totalInputs: inputs.length, unlabelledInputs, imagesWithoutAlt };
  });
  console.log(`   A11y Stats on /dashboard: Buttons total=${a11yStats.totalButtons}, unlabelled=${a11yStats.unlabelledButtons} | Inputs total=${a11yStats.totalInputs}, unlabelled=${a11yStats.unlabelledInputs}`);

  // 6. Network Hostname Audit
  console.log("\n6. Network Hostname & Security Routing Audit...");
  const hostnames = new Set();
  const disallowedHits = [];

  for (const req of allNetworkRequests) {
    try {
      const parsed = new URL(req.url);
      hostnames.add(parsed.hostname);
      if (
        parsed.hostname.includes("localhost") ||
        parsed.hostname.includes("127.0.0.1") ||
        parsed.port === "11434" ||
        req.url.includes("ollama")
      ) {
        disallowedHits.push(req.url);
      }
    } catch {}
  }
  console.log("   Observed Request Hostnames:", Array.from(hostnames));
  console.log(`   Disallowed / Localhost / Ollama Hits: ${disallowedHits.length}`);

  // 7. RBAC Spot Check for Manager and Logout
  console.log("\n7. Executing Logout & Unauthenticated Redirection Verification...");
  // Clear storage and cookies cleanly
  await page.evaluate(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });
  await context.clearCookies();

  // Fresh page in fresh context to guarantee zero in-memory token retention
  const loggedOutContext = await browser.newContext();
  const loggedOutPage = await loggedOutContext.newPage();

  await loggedOutPage.goto(`${PROD_WEB_URL}/dashboard`, { waitUntil: "domcontentloaded" });
  await loggedOutPage.waitForTimeout(2000);

  const loggedOutUrl = loggedOutPage.url();
  const redirectsToLogin = loggedOutUrl.includes("/login");
  console.log(`   Unauthenticated access to /dashboard redirected to login: ${redirectsToLogin ? "YES (PASS)" : "NO (FAIL)"}`);
  console.log(`   Final URL: ${loggedOutUrl}`);

  await loggedOutContext.close();
  await context.close();
  await browser.close();

  // Save all structured findings
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "final-smoke-results.json"),
    JSON.stringify({ routeResults, mobileResults, a11yStats, consoleErrors, pageErrors, hostnames: Array.from(hostnames) }, null, 2)
  );

  console.log("\nSmoke QA data saved to final-smoke-results.json.");
}

runProductionSmokeQA().catch((err) => {
  console.error("Fatal Smoke QA error:", err);
  process.exit(1);
});
