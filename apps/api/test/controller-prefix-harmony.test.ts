/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { LeavesController } from "../src/modules/leaves/leaves.controller.js";
import { PayrollController } from "../src/modules/payroll/payroll.controller.js";
import { PerformanceController } from "../src/modules/performance/performance.controller.js";
import { RecruitmentController } from "../src/modules/recruitment/recruitment.controller.js";
import { AssetsController } from "../src/modules/assets/assets.controller.js";
import { LearningController } from "../src/modules/learning/learning.controller.js";
import { ComplianceController } from "../src/modules/compliance/compliance.controller.js";
import { IntegrationsController } from "../src/modules/integrations/integrations.controller.js";

function getControllerPaths(target: any): string[] {
  const path = Reflect.getMetadata("path", target);
  if (Array.isArray(path)) return path;
  if (typeof path === "string") return [path];
  return [];
}

describe("Controller Route Prefix Harmonization (Part 3)", () => {
  it("harmonizes leaves controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(LeavesController);
    expect(paths).toContain("leaves");
  });

  it("harmonizes payroll controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(PayrollController);
    expect(paths).toContain("payroll");
  });

  it("harmonizes performance controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(PerformanceController);
    expect(paths).toContain("performance");
  });

  it("harmonizes recruitment controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(RecruitmentController);
    expect(paths).toContain("recruitment");
  });

  it("harmonizes assets controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(AssetsController);
    expect(paths).toContain("assets");
  });

  it("harmonizes learning controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(LearningController);
    expect(paths).toContain("learning");
  });

  it("harmonizes compliance controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(ComplianceController);
    expect(paths).toContain("compliance");
  });

  it("harmonizes integrations controller to provide clean domain path and transitional alias", () => {
    const paths = getControllerPaths(IntegrationsController);
    expect(paths).toContain("integrations");
  });
});
