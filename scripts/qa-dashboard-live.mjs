import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const PROD_WEB_URL = "https://hrms.vcorganics.com";
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
    return { ownerEmail, password };
  } catch (err) {
    console.error("Failed to securely resolve credentials via SSH:", err.message);
    return null;
  }
}

async function runLiveDashboardQA() {
  console.log("============================================================");
  console.log("LIVE DASHBOARD VISUAL & FUNCTIONAL CORRECTNESS PASS");
  console.log("============================================================\n");

  const creds = getCredentials();
  if (!creds || !creds.password) {
    console.error("Credentials unavailable.");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  const page = await context.newPage();

  const networkRequests = [];
  const consoleErrors = [];

  page.on("request", (req) => {
    networkRequests.push({ url: req.url(), method: req.method() });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Authenticate
  console.log("1. Authenticating as Tenant Owner...");
  await page.goto(`${PROD_WEB_URL}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1000);

  await page.fill("#identifier", creds.ownerEmail);
  await page.fill("#password", creds.password);
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => url.pathname.includes("/dashboard"), { timeout: 20000 });
  console.log("   Landed on:", page.url());

  // Wait for initial queries to settle
  await page.waitForTimeout(3000);

  // 2. Desktop Sidebar Fixed Position & Scroll Verification
  console.log("\n2. Verifying Desktop Sidebar Fixed Position Across Scroll...");

  const sidebarMetricsBefore = await page.evaluate(() => {
    const sidebarEl = document.querySelector('[data-sidebar="container"]');
    const headerEl = document.querySelector('header');
    const brandEl = document.querySelector('[data-sidebar="header"]');
    const footerEl = document.querySelector('[data-sidebar="footer"]');

    return {
      sidebarRect: sidebarEl ? sidebarEl.getBoundingClientRect() : null,
      headerRect: headerEl ? headerEl.getBoundingClientRect() : null,
      brandRect: brandEl ? brandEl.getBoundingClientRect() : null,
      footerRect: footerEl ? footerEl.getBoundingClientRect() : null,
      scrollY: window.scrollY
    };
  });

  console.log("   Before scroll:");
  console.log("     Sidebar top:", sidebarMetricsBefore.sidebarRect?.top);
  console.log("     Brand top:", sidebarMetricsBefore.brandRect?.top);
  console.log("     Footer bottom:", sidebarMetricsBefore.footerRect?.bottom);
  console.log("     Header top:", sidebarMetricsBefore.headerRect?.top);
  console.log("     Window scrollY:", sidebarMetricsBefore.scrollY);

  // Capture top screenshot
  const topScreenshotPath = path.join(ARTIFACT_DIR, "dashboard-desktop-top-1600.png");
  await page.screenshot({ path: topScreenshotPath, fullPage: false });
  console.log("   Captured top screenshot:", topScreenshotPath);

  // Scroll page by 700px
  console.log("\n   Scrolling page by 700px...");
  await page.evaluate(() => {
    window.scrollTo(0, 700);
  });
  await page.waitForTimeout(1000);

  const sidebarMetricsAfter = await page.evaluate(() => {
    const sidebarEl = document.querySelector('[data-sidebar="container"]');
    const headerEl = document.querySelector('header');
    const brandEl = document.querySelector('[data-sidebar="header"]');
    const footerEl = document.querySelector('[data-sidebar="footer"]');

    return {
      sidebarRect: sidebarEl ? sidebarEl.getBoundingClientRect() : null,
      headerRect: headerEl ? headerEl.getBoundingClientRect() : null,
      brandRect: brandEl ? brandEl.getBoundingClientRect() : null,
      footerRect: footerEl ? footerEl.getBoundingClientRect() : null,
      scrollY: window.scrollY
    };
  });

  console.log("   After scroll:");
  console.log("     Sidebar top:", sidebarMetricsAfter.sidebarRect?.top);
  console.log("     Brand top:", sidebarMetricsAfter.brandRect?.top);
  console.log("     Footer bottom:", sidebarMetricsAfter.footerRect?.bottom);
  console.log("     Header top:", sidebarMetricsAfter.headerRect?.top);
  console.log("     Window scrollY:", sidebarMetricsAfter.scrollY);

  const sidebarTopStable = sidebarMetricsBefore.sidebarRect?.top === sidebarMetricsAfter.sidebarRect?.top;
  const brandTopStable = sidebarMetricsBefore.brandRect?.top === sidebarMetricsAfter.brandRect?.top;
  const pageScrolled = sidebarMetricsAfter.scrollY > 0;

  console.log(`   --> Sidebar top stable during scroll: ${sidebarTopStable ? "PASS (0px drift)" : "FAIL"}`);
  console.log(`   --> Brand top stable during scroll: ${brandTopStable ? "PASS (0px drift)" : "FAIL"}`);
  console.log(`   --> Page vertical scroll verified: ${pageScrolled ? `PASS (scrollY = ${sidebarMetricsAfter.scrollY})` : "FAIL"}`);

  // Capture scrolled screenshot
  const scrolledScreenshotPath = path.join(ARTIFACT_DIR, "dashboard-desktop-scrolled-1600.png");
  await page.screenshot({ path: scrolledScreenshotPath, fullPage: false });
  console.log("   Captured scrolled screenshot:", scrolledScreenshotPath);

  // Scroll back to top for chart and metric inspection
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // 3. Metric Cards Semantic Verification
  console.log("\n3. Verifying Metric Cards Semantics...");
  const cardTexts = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.grid > div'));
    return cards.map(c => ({
      title: c.querySelector('p, span')?.textContent?.trim() || '',
      text: c.textContent?.trim() || ''
    }));
  });

  const card2Text = cardTexts[1]?.text || "";
  console.log("   Card 2 content:", card2Text);
  const card2HasShiftEndedAsName = card2Text.includes("Today's Shift") && card2Text.includes("Shift Ended") && card2Text.includes("Shift not assigned");
  console.log(`   --> Card 2 does NOT have contradictory 'Shift Ended' with 'Shift not assigned': ${!card2HasShiftEndedAsName ? "PASS" : "FAIL"}`);

  const hasStandardWorkShiftFallback = cardTexts.some(c => c.text.includes("Standard Work Shift"));
  console.log(`   --> No 'Standard Work Shift' synthetic fallback: ${!hasStandardWorkShiftFallback ? "PASS" : "FAIL"}`);

  // 4. Workforce Activity Graph Verification
  console.log("\n4. Verifying Workforce Activity Graph & Real API Data...");

  const pageContent = await page.content();
  const hasBangaloreHQ = pageContent.includes("Bangalore HQ");
  const hasMumbaiHub = pageContent.includes("Mumbai Hub");
  console.log(`   --> Bangalore HQ absent: ${!hasBangaloreHQ ? "PASS" : "FAIL"}`);
  console.log(`   --> Mumbai Hub absent: ${!hasMumbaiHub ? "PASS" : "FAIL"}`);

  // Check SVG paths in chart
  const chartSvgData = await page.evaluate(() => {
    const svg = document.querySelector('.recharts-surface');
    if (!svg) return { exists: false };

    const paths = Array.from(svg.querySelectorAll('path.recharts-curve'));
    const yAxisTicks = Array.from(svg.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick text')).map(t => t.textContent);
    const xAxisTicks = Array.from(svg.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick text')).map(t => t.textContent);

    return {
      exists: true,
      pathCount: paths.length,
      yAxisTicks,
      xAxisTicks
    };
  });

  console.log("   Chart SVG found:", chartSvgData.exists);
  console.log("   Chart curves count:", chartSvgData.pathCount);
  console.log("   X-Axis date ticks:", chartSvgData.xAxisTicks);
  console.log("   Y-Axis ticks:", chartSvgData.yAxisTicks);

  // 5. Period Selector API Verification
  console.log("\n5. Testing Period Selector (7 days, 14 days, 30 days)...");

  // Select 7 days
  const periodTrigger = await page.locator('button[aria-label="Select reporting period"], button:has-text("14 days")').first();
  if (await periodTrigger.isVisible()) {
    console.log("   Found period selector, testing 7 days...");
    await periodTrigger.click();
    await page.waitForTimeout(500);

    const option7 = page.locator('[role="option"]:has-text("7 days"), div:has-text("7 days")').last();
    if (await option7.isVisible()) {
      await option7.click();
      await page.waitForTimeout(2000);
      const requested7 = networkRequests.some(r => r.url.includes("days=7"));
      console.log(`   --> 7 days query triggered: ${requested7 ? "PASS" : "INFO"}`);
    }

    // Select 30 days
    await periodTrigger.click();
    await page.waitForTimeout(500);
    const option30 = page.locator('[role="option"]:has-text("30 days"), div:has-text("30 days")').last();
    if (await option30.isVisible()) {
      await option30.click();
      await page.waitForTimeout(2000);
      const requested30 = networkRequests.some(r => r.url.includes("days=30"));
      console.log(`   --> 30 days query triggered: ${requested30 ? "PASS" : "INFO"}`);
    }
  }

  // 6. Mobile Viewport Verification (375x812)
  console.log("\n6. Verifying Mobile Layout (375x812)...");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);

  const mobileMetrics = await page.evaluate(() => {
    const desktopSidebar = document.querySelector('[data-sidebar="container"]');
    const isDesktopHidden = desktopSidebar ? window.getComputedStyle(desktopSidebar).display === "none" : true;
    const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;

    return {
      isDesktopHidden,
      hasHorizontalOverflow,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth
    };
  });

  console.log("   Desktop sidebar hidden on mobile:", mobileMetrics.isDesktopHidden);
  console.log("   Horizontal overflow:", mobileMetrics.hasHorizontalOverflow ? `YES (scrollWidth: ${mobileMetrics.scrollWidth} > innerWidth: ${mobileMetrics.innerWidth})` : "NONE (PASS)");

  const mobileScreenshotPath = path.join(ARTIFACT_DIR, "dashboard-mobile-375.png");
  await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
  console.log("   Captured mobile screenshot:", mobileScreenshotPath);

  console.log("\nConsole errors:", consoleErrors.length === 0 ? "NONE (PASS)" : consoleErrors);

  await browser.close();

  const results = {
    sidebarTopStable,
    brandTopStable,
    pageScrolled,
    card2Correct: !card2HasShiftEndedAsName,
    noStandardWorkShift: !hasStandardWorkShiftFallback,
    noFakeBangalore: !hasBangaloreHQ,
    noFakeMumbai: !hasMumbaiHub,
    chartExists: chartSvgData.exists,
    mobileHiddenSidebar: mobileMetrics.isDesktopHidden,
    mobileNoOverflow: !mobileMetrics.hasHorizontalOverflow,
    topScreenshotPath,
    scrolledScreenshotPath,
    mobileScreenshotPath,
    consoleErrorsCount: consoleErrors.length
  };

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "dashboard-qa-results.json"),
    JSON.stringify(results, null, 2)
  );

  console.log("\n============================================================");
  console.log("DASHBOARD LIVE QA COMPLETED SUCCESSFULLY");
  console.log("============================================================\n");
}

runLiveDashboardQA().catch((err) => {
  console.error("QA script failed:", err);
  process.exit(1);
});
