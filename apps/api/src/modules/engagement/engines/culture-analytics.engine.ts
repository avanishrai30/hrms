/**
 * TASK 31 — CULTURE HEALTH INDEX (CHI) & WORKPLACE ANALYTICS ENGINE
 * Synthesizes engagement indices, eNPS, peer recognition volumes, and happiness ratings into an overall Culture Health Index (0-100).
 */

export interface CultureIndexInput {
  engagementScore: number; // 0 to 100
  enpsScore: number; // -100 to +100
  averageHappinessRating: number; // 1 to 5
  monthlyRecognitionsPerEmployee: number; // e.g. 1.5
  burnoutRiskAverage: number; // 0 to 100
}

export interface CultureHealthResult {
  cultureHealthIndex: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "D";
  pillarScores: {
    engagementWeight: number;
    enpsNormalizedWeight: number;
    happinessWeight: number;
    recognitionDensityWeight: number;
    wellbeingProtectionWeight: number;
  };
  summaryDiagnosis: string;
}

export class CultureAnalyticsEngine {
  /**
   * Synthesize organizational culture health.
   */
  static computeCultureHealth(input: CultureIndexInput): CultureHealthResult {
    // 1. Engagement (30% weight) -> score * 0.30
    const engagementWeight = input.engagementScore * 0.30;

    // 2. eNPS normalized from -100..+100 to 0..100 (25% weight)
    const normalizedEnps = ((input.enpsScore + 100) / 200) * 100;
    const enpsNormalizedWeight = normalizedEnps * 0.25;

    // 3. Happiness (1-5 scaled to 0-100) (15% weight)
    const normalizedHappiness = (input.averageHappinessRating / 5) * 100;
    const happinessWeight = normalizedHappiness * 0.15;

    // 4. Recognition Density (Target: >= 2 recognitions/emp/month = 100%) (15% weight)
    const recognitionScore = Math.min(100, (input.monthlyRecognitionsPerEmployee / 2.0) * 100);
    const recognitionDensityWeight = recognitionScore * 0.15;

    // 5. Wellbeing / Low Burnout Protection (15% weight)
    const wellbeingScore = Math.max(0, 100 - input.burnoutRiskAverage);
    const wellbeingProtectionWeight = wellbeingScore * 0.15;

    const rawChi =
      engagementWeight +
      enpsNormalizedWeight +
      happinessWeight +
      recognitionDensityWeight +
      wellbeingProtectionWeight;

    const cultureHealthIndex = Math.round(rawChi * 10) / 10;

    let grade: "A+" | "A" | "B" | "C" | "D" = "B";
    let summaryDiagnosis = "Healthy corporate culture with solid baseline engagement.";

    if (cultureHealthIndex >= 88) {
      grade = "A+";
      summaryDiagnosis = "World-class workplace culture with exceptional advocacy and vibrant peer recognition.";
    } else if (cultureHealthIndex >= 75) {
      grade = "A";
      summaryDiagnosis = "Strong culture with high morale and consistent recognition.";
    } else if (cultureHealthIndex >= 60) {
      grade = "B";
      summaryDiagnosis = "Moderate culture health with opportunities to elevate recognition and manager check-ins.";
    } else if (cultureHealthIndex >= 45) {
      grade = "C";
      summaryDiagnosis = "Culture warning signs detected: Low eNPS or elevated burnout signals.";
    } else {
      grade = "D";
      summaryDiagnosis = "Critical culture disengagement. Urgent leadership intervention needed.";
    }

    return {
      cultureHealthIndex,
      grade,
      pillarScores: {
        engagementWeight: Math.round(engagementWeight * 10) / 10,
        enpsNormalizedWeight: Math.round(enpsNormalizedWeight * 10) / 10,
        happinessWeight: Math.round(happinessWeight * 10) / 10,
        recognitionDensityWeight: Math.round(recognitionDensityWeight * 10) / 10,
        wellbeingProtectionWeight: Math.round(wellbeingProtectionWeight * 10) / 10
      },
      summaryDiagnosis
    };
  }
}
