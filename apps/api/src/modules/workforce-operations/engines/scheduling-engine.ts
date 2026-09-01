/**
 * TASK 29 — WORKFORCE SCHEDULING & SHIFT ROSTERING ENGINE
 * Auto-schedules workforce shifts based on headcount requirements, skills, and leaves.
 */

export interface ShiftSlotDemand {
  shiftId: string;
  shiftName: string;
  requiredHeadcount: number;
  requiredSkills?: string[];
}

export interface CandidateEmployee {
  id: string;
  name: string;
  skills: string[];
  isOnLeave: boolean;
  assignedShiftId?: string | null;
}

export interface ShiftScheduleAssignment {
  shiftId: string;
  shiftName: string;
  requiredHeadcount: number;
  assignedEmployees: Array<{ id: string; name: string }>;
  understaffedCount: number;
  isFullyStaffed: boolean;
}

export interface ScheduleOutput {
  totalRequiredHeadcount: number;
  totalAssignedHeadcount: number;
  coveragePercent: number;
  assignments: ShiftScheduleAssignment[];
}

export class SchedulingEngine {
  /**
   * Automatically assign available and skilled employees to shift demand slots.
   */
  static generateSchedule(
    slots: ShiftSlotDemand[],
    employees: CandidateEmployee[]
  ): ScheduleOutput {
    const availablePool = employees.filter((e) => !e.isOnLeave);
    const assignedIds = new Set<string>();

    let totalRequired = 0;
    let totalAssigned = 0;

    const results: ShiftScheduleAssignment[] = [];

    for (const slot of slots) {
      totalRequired += slot.requiredHeadcount;
      const assignedToSlot: Array<{ id: string; name: string }> = [];

      for (const candidate of availablePool) {
        if (assignedIds.has(candidate.id)) continue;
        if (assignedToSlot.length >= slot.requiredHeadcount) break;

        // Check skills if required
        if (slot.requiredSkills && slot.requiredSkills.length > 0) {
          const hasRequiredSkill = slot.requiredSkills.some((reqSkill) =>
            candidate.skills.includes(reqSkill)
          );
          if (!hasRequiredSkill) continue;
        }

        assignedToSlot.push({ id: candidate.id, name: candidate.name });
        assignedIds.add(candidate.id);
      }

      const understaffedCount = Math.max(0, slot.requiredHeadcount - assignedToSlot.length);
      totalAssigned += assignedToSlot.length;

      results.push({
        shiftId: slot.shiftId,
        shiftName: slot.shiftName,
        requiredHeadcount: slot.requiredHeadcount,
        assignedEmployees: assignedToSlot,
        understaffedCount,
        isFullyStaffed: understaffedCount === 0
      });
    }

    const coveragePercent =
      totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 1000) / 10 : 100;

    return {
      totalRequiredHeadcount: totalRequired,
      totalAssignedHeadcount: totalAssigned,
      coveragePercent,
      assignments: results
    };
  }
}
