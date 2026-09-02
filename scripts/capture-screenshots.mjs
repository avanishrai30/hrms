import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function run() {
  console.log("Starting Next.js server on port 3005...");
  const server = spawn("pnpm", ["--filter", "@vc-wms/web", "start", "-p", "3005"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd()
  });

  // Wait 5s for server to start
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    const browser = await chromium.launch();
    const targetDir = "/Users/avanish/.gemini/antigravity/brain/36d1acc3-4fd0-4587-82f0-7fe302242ec4/screenshots";

    const viewports = [
      { name: "desktop-1920", width: 1920, height: 1080 },
      { name: "desktop-1440", width: 1440, height: 900 },
      { name: "tablet-1024", width: 1024, height: 768 },
      { name: "tablet-768", width: 768, height: 1024 },
      { name: "mobile-375", width: 375, height: 812 }
    ];

    for (const vp of viewports) {
      console.log(`Capturing ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();
      await page.goto("http://localhost:3005/dashboard", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      const filePath = path.join(targetDir, `dashboard-${vp.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved screenshot: ${filePath}`);
      await context.close();
    }

    // Capture collapsed sidebar
    console.log("Capturing collapsed sidebar on desktop-1440...");
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    // Click collapse toggle
    const collapseBtn = page.locator('button[title="Collapse Sidebar"]');
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(500);
    }
    const collapsedPath = path.join(targetDir, "dashboard-collapsed-sidebar.png");
    await page.screenshot({ path: collapsedPath, fullPage: true });
    console.log(`Saved screenshot: ${collapsedPath}`);
    await context.close();

    await browser.close();
    console.log("Visual QA screenshots successfully captured!");
  } finally {
    server.kill();
  }
}

run().catch((err) => {
  console.error("Visual QA error:", err);
  process.exit(1);
});
