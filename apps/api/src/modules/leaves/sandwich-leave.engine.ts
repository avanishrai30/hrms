import { SandwichPolicyType } from "@prisma/client";

export interface DateItemBreakdown {
  dateStr: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isDeducted: boolean;
  reason: string;
}

export interface SandwichCalculationResult {
  totalCalendarDays: number;
  workingDays: number;
  deductedDays: number;
  sandwichPenaltyDays: number;
  breakdown: DateItemBreakdown[];
}

export class SandwichLeaveEngine {
  /**
   * Calculates effective leave duration and applies sandwich deduction rules.
   */
  static calculate(params: {
    startDate: Date;
    endDate: Date;
    isHalfDay?: boolean;
    sandwichPolicy?: SandwichPolicyType;
    holidays?: Array<{ date: Date; name?: string }>;
    weekendDays?: number[]; // 0 = Sunday, 6 = Saturday
  }): SandwichCalculationResult {
    const {
      startDate,
      endDate,
      isHalfDay = false,
      sandwichPolicy = SandwichPolicyType.NONE,
      holidays = [],
      weekendDays = [0, 6]
    } = params;

    if (isHalfDay) {
      const dateStr = startDate.toISOString().split("T")[0] ?? "";
      return {
        totalCalendarDays: 1,
        workingDays: 0.5,
        deductedDays: 0.5,
        sandwichPenaltyDays: 0,
        breakdown: [
          {
            dateStr,
            isWeekend: false,
            isHoliday: false,
            isDeducted: true,
            reason: "Half day leave"
          }
        ]
      };
    }

    // Build holiday map by YYYY-MM-DD
    const holidayMap = new Map<string, string>();
    for (const h of holidays) {
      const hDateStr = new Date(h.date).toISOString().split("T")[0] ?? "";
      holidayMap.set(hDateStr, h.name ?? "Public Holiday");
    }

    // Iterate through every calendar day
    const breakdown: DateItemBreakdown[] = [];
    const curr = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

    let workingDays = 0;
    let sandwichPenaltyDays = 0;

    while (curr <= end) {
      const dateStr = curr.toISOString().split("T")[0] ?? "";
      const dayOfWeek = curr.getUTCDay();
      const isWeekend = weekendDays.includes(dayOfWeek);
      const isHoliday = holidayMap.has(dateStr);
      const holidayName = holidayMap.get(dateStr);

      let isDeducted = false;
      let reason = "Working day leave";

      if (!isWeekend && !isHoliday) {
        isDeducted = true;
        workingDays += 1;
      } else if (isWeekend) {
        if (
          sandwichPolicy === SandwichPolicyType.WEEKENDS_ONLY ||
          sandwichPolicy === SandwichPolicyType.WEEKENDS_AND_HOLIDAYS
        ) {
          isDeducted = true;
          sandwichPenaltyDays += 1;
          reason = "Sandwich policy weekend deduction";
        } else {
          reason = "Weekend off (not deducted)";
        }
      } else if (isHoliday) {
        if (
          sandwichPolicy === SandwichPolicyType.HOLIDAYS_ONLY ||
          sandwichPolicy === SandwichPolicyType.WEEKENDS_AND_HOLIDAYS
        ) {
          isDeducted = true;
          sandwichPenaltyDays += 1;
          reason = `Sandwich policy holiday deduction (${holidayName})`;
        } else {
          reason = `Holiday off (${holidayName}) (not deducted)`;
        }
      }

      breakdown.push({
        dateStr,
        isWeekend,
        isHoliday,
        holidayName,
        isDeducted,
        reason
      });

      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    const deductedDays = workingDays + sandwichPenaltyDays;

    return {
      totalCalendarDays: breakdown.length,
      workingDays,
      deductedDays,
      sandwichPenaltyDays,
      breakdown
    };
  }
}
