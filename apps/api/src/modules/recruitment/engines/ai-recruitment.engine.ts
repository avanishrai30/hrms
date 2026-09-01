import { Injectable } from "@nestjs/common";

export interface MatchScoringInput {
  candidateSkills: string[];
  requiredSkills: string[];
  candidateExperience: number;
  minExperience: number;
  maxExperience: number;
  candidateEducation?: string | null;
  jobDescription: string;
}

export interface MatchScoringResult {
  overallMatchScore: number;
  skillsMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
  interviewQuestions: string[];
  recommendation: string;
}

export interface OfferDeclineRiskResult {
  declineProbability: number;
  riskFactors: string[];
  mitigationTips: string[];
  joiningConfidence: "HIGH" | "MODERATE" | "LOW";
}

@Injectable()
export class AiRecruitmentEngine {
  calculateMatchScore(input: MatchScoringInput): MatchScoringResult {
    const candidateSkillsLower = input.candidateSkills.map((s) => s.toLowerCase().trim());
    const requiredSkillsLower = input.requiredSkills.map((s) => s.toLowerCase().trim());

    // 1. Skill Match
    const matchingSkills = input.requiredSkills.filter((s) =>
      candidateSkillsLower.includes(s.toLowerCase().trim())
    );
    const missingSkills = input.requiredSkills.filter(
      (s) => !candidateSkillsLower.includes(s.toLowerCase().trim())
    );

    const skillsScore =
      requiredSkillsLower.length > 0
        ? Math.round((matchingSkills.length / requiredSkillsLower.length) * 100)
        : 85;

    // 2. Experience Match
    let expScore = 100;
    if (input.candidateExperience < input.minExperience) {
      const diff = input.minExperience - input.candidateExperience;
      expScore = Math.max(40, Math.round(100 - diff * 20));
    } else if (input.candidateExperience > input.maxExperience + 4) {
      expScore = 85; // slightly overqualified
    }

    // 3. Education Match
    const eduScore = input.candidateEducation ? 90 : 75;

    // 4. Weighted Overall Score
    const overall = Math.round(skillsScore * 0.5 + expScore * 0.35 + eduScore * 0.15);

    // 5. Generate tailored interview questions based on missing skills & experience
    const interviewQuestions = this.generateInterviewQuestions(input, missingSkills);

    const recommendation =
      overall >= 80
        ? "Highly Recommended: Strong skill alignment and relevant experience profile."
        : overall >= 60
        ? "Recommended with Training: Good foundational competencies, verify missing skills in technical round."
        : "Low Fit: Significant gaps in required core skills or requisite experience.";

    const summary = `Candidate matches ${matchingSkills.length} of ${input.requiredSkills.length || 1} required competencies with ${input.candidateExperience} years of industry experience.`;

    return {
      overallMatchScore: overall,
      skillsMatchScore: skillsScore,
      experienceMatchScore: expScore,
      educationMatchScore: eduScore,
      matchingSkills,
      missingSkills,
      summary,
      interviewQuestions,
      recommendation
    };
  }

  predictOfferDeclineRisk(
    candidateNoticePeriodDays: number,
    expectedCtc: number,
    offeredCtc: number,
    interviewOverallScore: number
  ): OfferDeclineRiskResult {
    let declineRisk = 15; // baseline 15%
    const riskFactors: string[] = [];
    const mitigationTips: string[] = [];

    // Notice period friction
    if (candidateNoticePeriodDays >= 60) {
      declineRisk += 25;
      riskFactors.push(`Long notice period (${candidateNoticePeriodDays} days) increases counter-offer risks.`);
      mitigationTips.push("Offer buyout of notice period or initiate weekly engagement calls.");
    } else if (candidateNoticePeriodDays >= 30) {
      declineRisk += 10;
    }

    // Compensation delta
    if (offeredCtc < expectedCtc) {
      const gapPercent = ((expectedCtc - offeredCtc) / expectedCtc) * 100;
      if (gapPercent > 10) {
        declineRisk += 30;
        riskFactors.push(`Offered CTC is ${gapPercent.toFixed(1)}% below candidate's expected CTC.`);
        mitigationTips.push("Consider adding a joining bonus or early performance review milestone.");
      } else {
        declineRisk += 15;
      }
    }

    // Candidate engagement/evaluation feedback
    if (interviewOverallScore < 3.5) {
      declineRisk += 10;
      riskFactors.push("Candidate demonstrated reserved sentiment in final rounds.");
    }

    declineRisk = Math.min(95, Math.max(5, declineRisk));

    const joiningConfidence = declineRisk <= 25 ? "HIGH" : declineRisk <= 55 ? "MODERATE" : "LOW";

    return {
      declineProbability: declineRisk,
      riskFactors,
      mitigationTips,
      joiningConfidence
    };
  }

  private generateInterviewQuestions(input: MatchScoringInput, missingSkills: string[]): string[] {
    const qs: string[] = [
      `Can you walk us through your experience leading architecture decisions related to ${input.candidateSkills[0] || "core technologies"}?`,
      `How do you handle production incidents, debugging, and system telemetry in large-scale deployments?`
    ];

    if (missingSkills.length > 0) {
      qs.push(`The role requires proficiency in ${missingSkills[0]}. Have you had any hands-on exposure or adjacent experience with this?`);
    }

    if (input.candidateExperience > input.maxExperience) {
      qs.push("Given your extensive background, what excites you most about this particular role and team scope?");
    }

    return qs;
  }
}
