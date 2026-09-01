import { Injectable } from "@nestjs/common";
import type { NineBoxGridPosition } from "@prisma/client";

export interface NineBoxMappingInput {
  performanceScore: number; // 1.0 - 5.0
  potentialScore: number; // 1.0 - 5.0
}

export interface NineBoxGridDetail {
  position: NineBoxGridPosition;
  label: string;
  category: "TOP_TALENT" | "CORE_TALENT" | "ACTION_NEEDED";
  developmentAction: string;
}

@Injectable()
export class SuccessionNineBoxEngine {
  /**
   * Maps 2D Performance vs. Potential coordinates to the 9-Box Grid
   */
  mapToNineBoxGrid(input: NineBoxMappingInput): NineBoxGridDetail {
    const perfTier = input.performanceScore >= 3.8 ? "HIGH" : input.performanceScore >= 2.8 ? "MEDIUM" : "LOW";
    const potTier = input.potentialScore >= 3.8 ? "HIGH" : input.potentialScore >= 2.8 ? "MEDIUM" : "LOW";

    if (perfTier === "HIGH" && potTier === "HIGH") {
      return {
        position: "STAR_HIGH_POTENTIAL",
        label: "Star (High Performance, High Potential)",
        category: "TOP_TALENT",
        developmentAction: "Fast-track promotion, cross-functional leadership, executive sponsorship."
      };
    }

    if (perfTier === "HIGH" && potTier === "MEDIUM") {
      return {
        position: "HIGH_PERFORMER_GROWTH",
        label: "High Performer (High Performance, Medium Potential)",
        category: "TOP_TALENT",
        developmentAction: "Broaden scope, mentor junior staff, reward and retain."
      };
    }

    if (perfTier === "HIGH" && potTier === "LOW") {
      return {
        position: "SOLID_PERFORMER_KEY",
        label: "Solid Professional (High Performance, Low Potential)",
        category: "CORE_TALENT",
        developmentAction: "Retain in subject-matter expert role, optimize mastery."
      };
    }

    if (perfTier === "MEDIUM" && potTier === "HIGH") {
      return {
        position: "HIGH_POTENTIAL_DEVELOP",
        label: "High Potential (Medium Performance, High Potential)",
        category: "TOP_TALENT",
        developmentAction: "Provide stretch assignments and coaching to accelerate execution."
      };
    }

    if (perfTier === "MEDIUM" && potTier === "MEDIUM") {
      return {
        position: "CORE_CONTRIBUTOR",
        label: "Core Player (Medium Performance, Medium Potential)",
        category: "CORE_TALENT",
        developmentAction: "Standard development, continuous goal alignment and upskilling."
      };
    }

    if (perfTier === "MEDIUM" && potTier === "LOW") {
      return {
        position: "EFFECTIVE_PERFORMER",
        label: "Effective Contributor (Medium Performance, Low Potential)",
        category: "CORE_TALENT",
        developmentAction: "Maintain performance standard; evaluate fit for lateral moves."
      };
    }

    if (perfTier === "LOW" && potTier === "HIGH") {
      return {
        position: "DILEMMA_QUESTION_MARK",
        label: "Enigma (Low Performance, High Potential)",
        category: "ACTION_NEEDED",
        developmentAction: "Investigate root cause of underperformance; role realignment or coaching."
      };
    }

    if (perfTier === "LOW" && potTier === "MEDIUM") {
      return {
        position: "UNDERPERFORMER_COACH",
        label: "Inconsistent Player (Low Performance, Medium Potential)",
        category: "ACTION_NEEDED",
        developmentAction: "Implement Performance Improvement Plan (PIP) with structured 60-day check-ins."
      };
    }

    // LOW / LOW
    return {
      position: "RISK_LOW_PERFORMER",
      label: "Talent Risk (Low Performance, Low Potential)",
      category: "ACTION_NEEDED",
      developmentAction: "Initiate formal exit or immediate remedial action."
    };
  }
}
