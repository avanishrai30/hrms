import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toContain("px-4");
    expect(cn("px-2", "px-4")).not.toContain("px-2");
  });
});

