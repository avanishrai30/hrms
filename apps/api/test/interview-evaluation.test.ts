import { describe, expect, it } from "vitest";
import { CandidateEvaluationEngine } from "../src/modules/recruitment/engines/evaluation.engine.js";
import { AiRecruitmentEngine } from "../src/modules/recruitment/engines/ai-recruitment.engine.js";

describe("Candidate Evaluation & AI Recruitment Engine (Task 20)", () => {
  const evalEngine = new CandidateEvaluationEngine();
  const aiEngine = new AiRecruitmentEngine();

  it("computes weighted multi-criteria interview score and recommendation", () => {
    // 5 in Technical, 4 in Problem Solving, 4 in Exp, 4 in Comm, 4 in Culture, 4 in Leadership
    const result = evalEngine.calculateScore({
      technicalScore: 5,
      problemSolving: 4,
      experienceScore: 4,
      communication: 4,
      cultureFit: 4,
      leadership: 4
    });

    // 5*0.25 (1.25) + 4*0.20 (0.8) + 4*0.20 (0.8) + 4*0.15 (0.6) + 4*0.10 (0.4) + 4*0.10 (0.4) = 4.25
    expect(result.overallScore).toBe(4.25);
    expect(result.weightedPercent).toBe(85);
    expect(result.recommendation).toBe("HIRE");
  });

  it("ranks candidates as STRONG_HIRE when overall score exceeds 4.5", () => {
    const result = evalEngine.calculateScore({
      technicalScore: 5,
      problemSolving: 5,
      experienceScore: 5,
      communication: 4,
      cultureFit: 5,
      leadership: 4
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(4.5);
    expect(result.recommendation).toBe("STRONG_HIRE");
  });

  it("aggregates multiple panel interview feedbacks cleanly", () => {
    const feedback1 = {
      technicalScore: 5,
      problemSolving: 4,
      experienceScore: 4,
      communication: 5,
      cultureFit: 4,
      leadership: 4
    };
    const feedback2 = {
      technicalScore: 3,
      problemSolving: 3,
      experienceScore: 3,
      communication: 3,
      cultureFit: 3,
      leadership: 3
    };

    const aggregated = evalEngine.aggregatePanelScores([feedback1, feedback2]);
    expect(aggregated.breakdown.technical).toBe(4);
    expect(aggregated.breakdown.problemSolving).toBe(3.5);
  });

  it("computes JD-resume match scoring with skill gap analysis", () => {
    const match = aiEngine.calculateMatchScore({
      candidateSkills: ["TypeScript", "React", "Node.js"],
      requiredSkills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker"],
      candidateExperience: 4,
      minExperience: 3,
      maxExperience: 6,
      candidateEducation: "Bachelor's Degree",
      jobDescription: "Senior Full Stack Engineer responsible for microservices and cloud apps."
    });

    expect(match.matchingSkills).toEqual(["TypeScript", "React", "Node.js"]);
    expect(match.missingSkills).toEqual(["PostgreSQL", "Docker"]);
    expect(match.skillsMatchScore).toBe(60); // 3 of 5
    expect(match.experienceMatchScore).toBe(100);
    expect(match.interviewQuestions.length).toBeGreaterThan(0);
  });

  it("predicts offer decline probability based on notice period and compensation delta", () => {
    const risk = aiEngine.predictOfferDeclineRisk(60, 2500000, 2000000, 3.2);

    expect(risk.declineProbability).toBeGreaterThanOrEqual(50);
    expect(risk.joiningConfidence).toBe("LOW");
    expect(risk.riskFactors.some((r) => r.includes("notice period"))).toBe(true);
    expect(risk.riskFactors.some((r) => r.includes("expected CTC"))).toBe(true);
  });
});
