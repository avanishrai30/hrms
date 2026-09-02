import { apiRequest } from "./api";

export interface TodayAttendance {
  record: { status: string; checkInAt: string | null; checkOutAt: string | null } | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

export interface LeaveBalance {
  id: string;
  availableDays: number;
  leaveType?: { name: string; code: string } | null;
}

export interface LeaveRequestSummary {
  requests: Array<{ id: string; status: string; startDate?: string; endDate?: string }>;
}

export interface PayslipSummary {
  id: string;
  month: number;
  year: number;
  status: string;
}

export interface Announcement {
  id: string;
  title: string;
  priority?: string;
}

interface EmployeeListResponse {
  employees?: unknown[];
}

export type DashboardData = {
  attendance?: TodayAttendance | undefined;
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequestSummary["requests"];
  payslips: PayslipSummary[];
  announcements: Announcement[];
  employeeCount: number | null;
  unavailable: string[];
};

async function optional<T>(label: string, request: Promise<T>) {
  try {
    return { label, data: await request };
  } catch (error) {
    return { label, error };
  }
}

export async function loadDashboard(): Promise<DashboardData> {
  const [attendance, balances, requests, payslips, announcements, employees] = await Promise.all([
    optional("Attendance", apiRequest<TodayAttendance>("/attendance/me/today")),
    optional("Leave balances", apiRequest<LeaveBalance[]>("/leaves/balances/me")),
    optional("Leave requests", apiRequest<LeaveRequestSummary>("/leaves/requests/me")),
    optional("Payslips", apiRequest<PayslipSummary[]>("/payslips/me")),
    optional("Announcements", apiRequest<Announcement[]>("/announcements")),
    optional("Employees", apiRequest<EmployeeListResponse | unknown[]>("/employees?limit=100"))
  ]);

  const unavailable = [attendance, balances, requests, payslips, announcements, employees]
    .filter((result) => "error" in result)
    .map((result) => result.label);
  const employeeData = "data" in employees ? employees.data : null;

  return {
    attendance: "data" in attendance ? attendance.data : undefined,
    leaveBalances: "data" in balances ? balances.data : [],
    leaveRequests: "data" in requests ? requests.data.requests ?? [] : [],
    payslips: "data" in payslips ? payslips.data : [],
    announcements: "data" in announcements ? announcements.data : [],
    employeeCount: Array.isArray(employeeData) ? employeeData.length : Array.isArray(employeeData?.employees) ? employeeData.employees.length : null,
    unavailable
  };
}

export function roleLabel(permissions: string[]) {
  if (permissions.includes("tenant.settings.read")) return "Admin workspace";
  if (permissions.includes("employees.read")) return "HR workspace";
  if (permissions.includes("approvals.action")) return "Manager workspace";
  return "Employee workspace";
}

export function statusTone(status?: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "PRESENT" || status === "APPROVED" || status === "DISTRIBUTED") return "success";
  if (status?.includes("PENDING") || status === "GENERATED") return "warning";
  if (status === "ABSENT" || status === "REJECTED") return "danger";
  return "neutral";
}
