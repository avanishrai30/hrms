/**
 * TASK 32 — EMPLOYEE LIFECYCLE TIMELINE SYNTHESIS ENGINE
 * Aggregates career milestones, promotions, LMS certifications, performance reviews, rewards, and asset events into a chronological timeline.
 */

export interface RawTimelineEvent {
  id: string;
  date: Date | string;
  eventType:
    | "JOINING"
    | "PROMOTION"
    | "TRANSFER"
    | "APPRAISAL_REVIEW"
    | "CERTIFICATION_EARNED"
    | "RECOGNITION_RECEIVED"
    | "SALARY_REVISION"
    | "ASSET_ASSIGNED"
    | "POLICY_ACKNOWLEDGED";
  title: string;
  description: string;
  badge?: string;
}

export interface TimelineMilestone {
  id: string;
  dateIso: string;
  formattedDate: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export class TimelineEngine {
  private static readonly ICON_MAP: Record<string, { icon: string; category: string }> = {
    JOINING: { icon: "🎉", category: "CAREER_START" },
    PROMOTION: { icon: "🚀", category: "PROMOTION" },
    TRANSFER: { icon: "🔄", category: "MOBILITY" },
    APPRAISAL_REVIEW: { icon: "📑", category: "PERFORMANCE" },
    CERTIFICATION_EARNED: { icon: "🏆", category: "LEARNING" },
    RECOGNITION_RECEIVED: { icon: "🌟", category: "RECOGNITION" },
    SALARY_REVISION: { icon: "💰", category: "COMPENSATION" },
    ASSET_ASSIGNED: { icon: "💻", category: "IT_EQUIPMENT" },
    POLICY_ACKNOWLEDGED: { icon: "📜", category: "COMPLIANCE" }
  };

  /**
   * Sort and enrich raw lifecycle milestones into a structured timeline.
   */
  static synthesizeTimeline(events: RawTimelineEvent[]): TimelineMilestone[] {
    const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sorted.map((e) => {
      const d = new Date(e.date);
      const meta = this.ICON_MAP[e.eventType] || { icon: "📌", category: "GENERAL" };

      return {
        id: e.id,
        dateIso: d.toISOString(),
        formattedDate: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }),
        category: meta.category,
        icon: meta.icon,
        title: e.title,
        description: e.description,
        badge: e.badge
      };
    });
  }
}
