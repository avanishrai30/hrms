import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "/Users/avanish/.gemini/antigravity/brain/36d1acc3-4fd0-4587-82f0-7fe302242ec4/screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const PORT = 3006;
console.log(`Starting Next.js server on port ${PORT}...`);
const server = spawn("pnpm", ["--filter", "@vc-wms/web", "start", "-p", String(PORT)], {
  cwd: "/Users/avanish/Documents/Hrms-vc/vc-organics-wms",
  stdio: "inherit",
  shell: true
});

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server at ${url} failed to respond within ${timeout}ms`);
}

async function run() {
  try {
    await waitForServer(`http://localhost:${PORT}/dashboard`);
    const browser = await chromium.launch({ headless: true });

    const routes = [
      { name: "profile", path: "/profile" },
      { name: "attendance", path: "/attendance" },
      { name: "leave", path: "/leave" },
      { name: "leave-request", path: "/leave/request" },
      { name: "leave-calendar", path: "/leave/calendar" },
      { name: "requests", path: "/requests" },
      { name: "payslips", path: "/payslips" },
      { name: "documents", path: "/documents" },
      { name: "announcements", path: "/announcements" },
      { name: "id-card", path: "/id-card" }
    ];

    // Desktop
    const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageDesktop = await contextDesktop.newPage();

    for (const r of routes) {
      console.log(`Capturing ${r.name} desktop...`);
      await pageDesktop.goto(`http://localhost:${PORT}${r.path}`, { waitUntil: "networkidle" });
      await pageDesktop.waitForTimeout(400);
      const outPath = path.join(ARTIFACT_DIR, `ess-${r.name}-desktop-1440.png`);
      await pageDesktop.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved: ${outPath}`);
    }
    await contextDesktop.close();

    // Mobile
    const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
    const pageMobile = await contextMobile.newPage();

    for (const r of ["profile", "attendance", "leave", "payslips", "id-card"]) {
      console.log(`Capturing ${r} mobile...`);
      await pageMobile.goto(`http://localhost:${PORT}/${r === "id-card" ? "id-card" : r}`, { waitUntil: "networkidle" });
      await pageMobile.waitForTimeout(400);
      const outPath = path.join(ARTIFACT_DIR, `ess-${r}-mobile-375.png`);
      await pageMobile.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved: ${outPath}`);
    }
    await contextMobile.close();

    await browser.close();
    console.log("All ESS screenshots successfully captured!");
  } finally {
    server.kill("SIGTERM");
  }
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  server.kill("SIGTERM");
  process.exit(1);
});
