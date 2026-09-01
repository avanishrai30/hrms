import { describe, expect, it } from "vitest";
import { TimelineEngine, type RawTimelineEvent } from "../src/modules/ess/engines/timeline.engine.js";

describe("TimelineEngine", () => {
  it("should synthesize and chronologically sort employee events in descending order", () => {
    const raw: RawTimelineEvent[] = [
      {
        id: "ev-1",
        date: "2024-01-01T00:00:00Z",
        eventType: "JOINING",
        title: "Joined VC Organics",
        description: "Welcome event"
      },
      {
        id: "ev-2",
        date: "2025-06-01T00:00:00Z",
        eventType: "PROMOTION",
        title: "Promoted to Senior Engineer",
        description: "Merit promotion"
      },
      {
        id: "ev-3",
        date: "2026-08-15T00:00:00Z",
        eventType: "RECOGNITION_RECEIVED",
        title: "Spot Award",
        description: "Star Performer"
      }
    ];

    const timeline = TimelineEngine.synthesizeTimeline(raw);

    expect(timeline.length).toBe(3);
    // Most recent event first
    expect(timeline[0]?.id).toBe("ev-3");
    expect(timeline[0]?.category).toBe("RECOGNITION");
    expect(timeline[0]?.icon).toBe("🌟");

    expect(timeline[1]?.id).toBe("ev-2");
    expect(timeline[1]?.category).toBe("PROMOTION");
    expect(timeline[1]?.icon).toBe("🚀");

    expect(timeline[2]?.id).toBe("ev-1");
    expect(timeline[2]?.category).toBe("CAREER_START");
    expect(timeline[2]?.icon).toBe("🎉");
  });
});
