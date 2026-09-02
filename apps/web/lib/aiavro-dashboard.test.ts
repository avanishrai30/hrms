import { describe, it, expect } from "vitest";
import { statusTone } from "./dashboard-data";

describe("AIavro Dashboard Design & Data Foundations", () => {
  it("computes correct status tones according to AIavro design system tokens", () => {
    expect(statusTone("PRESENT")).toBe("success");
    expect(statusTone("APPROVED")).toBe("success");
    expect(statusTone("PENDING")).toBe("warning");
    expect(statusTone("ABSENT")).toBe("danger");
    expect(statusTone("OTHER")).toBe("neutral");
  });
});
