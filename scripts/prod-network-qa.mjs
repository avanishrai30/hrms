import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const PROD_URL = "https://hrms.vcorganics.com";
const ARTIFACT_DIR = "/Users/avanish/.gemini/antigravity/brain/36d1acc3-4fd0-4587-82f0-7fe302242ec4/screenshots";

async function runProdQA() {
  console.log(`Starting Production QA against: ${PROD_URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const networkLogs = [];
  const consoleLogs = [];
  const pageErrors = [];

  page.on("request", (req) => {
    networkLogs.push({
      type: "REQUEST",
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType()
    });
  });

  page.on("response", (res) => {
    networkLogs.push({
      type: "RESPONSE",
      url: res.url(),
      status: res.status(),
      statusText: res.statusText()
    });
  });

  page.on("console", (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  try {
    console.log("Navigating to production login/entry...");
    const response = await page.goto(PROD_URL, { waitUntil: "networkidle", timeout: 30000 });
    console.log(`Production entry status: ${response ? response.status() : "null"}`);

    const currentUrl = page.url();
    console.log(`Active URL: ${currentUrl}`);

    const screenshotPath = path.join(ARTIFACT_DIR, "prod-live-entry-1440.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot: ${screenshotPath}`);

    // Inspect routes
    const routes = ["/dashboard", "/profile", "/attendance", "/leave", "/payslips", "/documents", "/id-card"];
    for (const r of routes) {
      console.log(`Visiting ${PROD_URL}${r}...`);
      await page.goto(`${PROD_URL}${r}`, { waitUntil: "networkidle", timeout: 20000 }).catch((e) => console.log(`Route ${r}: ${e.message}`));
      await page.waitForTimeout(500);
      const routeScreenshot = path.join(ARTIFACT_DIR, `prod-live-${r.replace(/\//g, "-").slice(1)}-1440.png`);
      await page.screenshot({ path: routeScreenshot, fullPage: true }).catch(() => {});
    }

    console.log("\n--- Production Network Requests ---");
    const uniqueHosts = new Set(networkLogs.map((l) => {
      try {
        return new URL(l.url).hostname;
      } catch {
        return "unknown";
      }
    }));
    console.log("Observed Request Hostnames:", Array.from(uniqueHosts));

    console.log("\n--- Production Console Messages ---");
    console.log(`Total console messages: ${consoleLogs.length}`);
    const errors = consoleLogs.filter((c) => c.type === "error");
    console.log(`Total console errors: ${errors.length}`);
    errors.forEach((e) => console.log("Console Error:", e.text));

    console.log(`\nTotal page errors: ${pageErrors.length}`);
  } finally {
    await browser.close();
  }
}

runProdQA().catch((err) => {
  console.error("Production QA execution failed:", err.message);
});
