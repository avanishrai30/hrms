import { describe, expect, it } from "vitest";
import { RecognitionEngine } from "../src/modules/engagement/engines/recognition.engine.js";

describe("RecognitionEngine", () => {
  it("synthesizes workforce recognition activity, points totals, and top contributors", () => {
    const recognitions = [
      {
        id: "r1",
        senderEmployeeId: "emp-1",
        receiverEmployeeId: "emp-2",
        recognitionType: "PEER_APPRECIATION",
        pointsAwarded: 50,
        badgeCategory: "INNOVATION"
      },
      {
        id: "r2",
        senderEmployeeId: "emp-1",
        receiverEmployeeId: "emp-2",
        recognitionType: "PEER_APPRECIATION",
        pointsAwarded: 100,
        badgeCategory: "INNOVATION"
      },
      {
        id: "r3",
        senderEmployeeId: "emp-3",
        receiverEmployeeId: "emp-4",
        recognitionType: "MANAGER_KUDOS",
        pointsAwarded: 150,
        badgeCategory: "CORE_VALUES"
      }
    ];

    const result = RecognitionEngine.analyzeRecognitions(recognitions);

    expect(result.totalRecognitionsCount).toBe(3);
    expect(result.totalPointsDistributed).toBe(300);
    expect(result.peerToManagerRatio).toBe(2);
    expect(result.topValueCategory).toBe("INNOVATION");
    expect(result.mostRecognizedEmployeeId).toBe("emp-2");
    expect(result.mostActiveSenderEmployeeId).toBe("emp-1");
  });

  it("handles empty recognition list safely", () => {
    const result = RecognitionEngine.analyzeRecognitions([]);
    expect(result.totalRecognitionsCount).toBe(0);
    expect(result.totalPointsDistributed).toBe(0);
    expect(result.topValueCategory).toBe("N/A");
  });
});
