import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PWA Capabilities & App Manifest (Task 18)", () => {
  it("validates that the Next.js manifest defines standalone display and icons", () => {
    const manifestFile = readFileSync(
      new URL("../../web/app/manifest.ts", import.meta.url),
      "utf8"
    );

    expect(manifestFile).toContain('display: "standalone"');
    expect(manifestFile).toContain('start_url: "/dashboard"');
    expect(manifestFile).toContain("theme_color");
    expect(manifestFile).toContain("background_color");
    expect(manifestFile).toContain("icons");
  });

  it("validates that service worker sw.js contains lifecycle and push event listeners", () => {
    const swFile = readFileSync(
      new URL("../../web/public/sw.js", import.meta.url),
      "utf8"
    );

    expect(swFile).toContain('addEventListener("install"');
    expect(swFile).toContain('addEventListener("activate"');
  });
});
