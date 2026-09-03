import type { DirectoryEmployeeView, PermissionCode } from "@vc-wms/shared-types";

export interface DirectoryPageResponse {
  items: DirectoryEmployeeView[];
  total: number;
  limit: number;
  offset: number;
}

export function normalizeDirectoryPageResponse(input: DirectoryEmployeeView[] | DirectoryPageResponse | null | undefined): DirectoryPageResponse {
  if (!input) {
    return { items: [], total: 0, limit: 0, offset: 0 };
  }

  if (Array.isArray(input)) {
    return { items: input, total: input.length, limit: input.length, offset: 0 };
  }

  return {
    items: Array.isArray(input.items) ? input.items : [],
    total: Number.isFinite(input.total) ? input.total : 0,
    limit: Number.isFinite(input.limit) ? input.limit : input.items.length,
    offset: Number.isFinite(input.offset) ? input.offset : 0
  };
}

export function canRenderTenantWorkforceTable(permissions: readonly PermissionCode[] | readonly string[]): boolean {
  return permissions.includes("directory.view") || permissions.includes("employees.read");
}

export function unavailable(value?: string | null): string {
  return value && value.trim() ? value : "—";
}

export function resolveRegionOrBusinessUnit(employee: Pick<DirectoryEmployeeView, "region" | "businessUnit">): string {
  return unavailable(employee.region || employee.businessUnit);
}

export function sanitizeCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);

  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function buildWorkforceCurrentPageCsv(employees: DirectoryEmployeeView[]): string {
  const headers = ["Employee Code", "Name", "Email", "Department", "Region / Unit", "Status"];
  const rows = employees.map((employee) => [
    employee.employeeCode,
    employee.fullName,
    employee.email,
    employee.department || "",
    employee.region || employee.businessUnit || "",
    employee.status
  ]);

  return [headers, ...rows].map((row) => row.map(sanitizeCsvCell).join(",")).join("\r\n");
}
