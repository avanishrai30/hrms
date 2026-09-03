export interface PayslipPdfData {
  tenantName: string;
  month: number;
  year: number;
  version: number;
  currency: string;
  generatedAt: Date | string;
  employee: {
    fullName: string;
    employeeCode: string;
    department?: string;
    designation?: string;
    joiningDate?: string;
  };
  attendance: {
    workingDays: number;
    payableDays: number;
    presentDays: number;
    paidLeaveDays: number;
    holidayDays: number;
    halfDays: number;
    absentDays: number;
  };
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  employerContributions: Array<{ name: string; amount: number }>;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export class PayslipPdfEngine {
  private static readonly MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  /**
   * Generates a deterministic A4 PDF-1.4 document buffer for an employee payslip.
   */
  static generatePayslipPdf(data: PayslipPdfData): Buffer {
    const monthName = this.MONTH_NAMES[data.month - 1] ?? `Month ${data.month}`;
    const generatedDateStr = new Date(data.generatedAt).toLocaleDateString();

    const escapePdf = (str: string) =>
      str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const formatAmount = (amount: number) =>
      `${data.currency} ${amount.toLocaleString()}`;

    // Construct PostScript-like PDF content stream
    const contentOps: string[] = [];

    // Header Background Box (Emerald brand)
    contentOps.push("0.02 0.58 0.41 rg"); // Emerald green
    contentOps.push("40 760 515 50 re f");

    // Header Text
    contentOps.push("BT");
    contentOps.push("/F2 16 Tf");
    contentOps.push("1 1 1 rg"); // White text
    contentOps.push(`55 785 Td (${escapePdf(data.tenantName.toUpperCase())}) Tj`);
    contentOps.push("/F1 10 Tf");
    contentOps.push(`0 -15 Td (PAYSLIP FOR ${escapePdf(monthName.toUpperCase())} ${data.year} - VERSION ${data.version}) Tj`);
    contentOps.push("ET");

    // Employee Details Section Box
    contentOps.push("0.96 0.97 0.98 rg"); // Light slate gray box
    contentOps.push("40 680 515 65 re f");
    contentOps.push("0.85 0.88 0.91 RG"); // Border
    contentOps.push("40 680 515 65 re S");

    contentOps.push("BT");
    contentOps.push("/F2 10 Tf");
    contentOps.push("0.1 0.1 0.1 rg");
    contentOps.push(`55 725 Td (Employee Name:) Tj`);
    contentOps.push("/F1 10 Tf");
    contentOps.push(`80 0 Td (${escapePdf(data.employee.fullName)}) Tj`);
    contentOps.push("/F2 10 Tf");
    contentOps.push(`160 0 Td (Employee Code:) Tj`);
    contentOps.push("/F1 10 Tf");
    contentOps.push(`85 0 Td (${escapePdf(data.employee.employeeCode)}) Tj`);

    contentOps.push("/F2 10 Tf");
    contentOps.push(`-325 -16 Td (Department:) Tj`);
    contentOps.push("/F1 10 Tf");
    contentOps.push(`80 0 Td (${escapePdf(data.employee.department ?? "General")}) Tj`);
    contentOps.push("/F2 10 Tf");
    contentOps.push(`160 0 Td (Designation:) Tj`);
    contentOps.push("/F1 10 Tf");
    contentOps.push(`85 0 Td (${escapePdf(data.employee.designation ?? "Staff")}) Tj`);

    contentOps.push("/F2 10 Tf");
    contentOps.push(`-325 -16 Td (Payable Days:) Tj`);
    contentOps.push("/F1 10 Tf");
    contentOps.push(`80 0 Td (${data.attendance.payableDays} / ${data.attendance.workingDays} Days) Tj`);
    contentOps.push("/F2 10 Tf");
    contentOps.push(`160 0 Td (Generated On:) Tj`);
    contentOps.push("/F1 10 Tf");
    contentOps.push(`85 0 Td (${escapePdf(generatedDateStr)}) Tj`);
    contentOps.push("ET");

    // Attendance Summary Box
    contentOps.push("0.98 0.98 0.99 rg");
    contentOps.push("40 635 515 35 re f");
    contentOps.push("0.85 0.88 0.91 RG");
    contentOps.push("40 635 515 35 re S");

    contentOps.push("BT");
    contentOps.push("/F2 9 Tf");
    contentOps.push("0.3 0.3 0.3 rg");
    contentOps.push(
      `55 648 Td (Present: ${data.attendance.presentDays}  |  Paid Leave: ${data.attendance.paidLeaveDays}  |  Holidays: ${data.attendance.holidayDays}  |  Half Days: ${data.attendance.halfDays}  |  Absent: ${data.attendance.absentDays}) Tj`
    );
    contentOps.push("ET");

    // Tables Header Box (Earnings vs Deductions)
    contentOps.push("0.92 0.94 0.96 rg");
    contentOps.push("40 595 250 25 re f"); // Earnings header
    contentOps.push("40 595 250 25 re S");
    contentOps.push("305 595 250 25 re f"); // Deductions header
    contentOps.push("305 595 250 25 re S");

    contentOps.push("BT");
    contentOps.push("/F2 10 Tf");
    contentOps.push("0.1 0.1 0.1 rg");
    contentOps.push(`55 605 Td (EARNINGS) Tj`);
    contentOps.push(`170 0 Td (AMOUNT \\(${escapePdf(data.currency)}\\)) Tj`);
    contentOps.push(`95 0 Td (DEDUCTIONS) Tj`);
    contentOps.push(`170 0 Td (AMOUNT \\(${escapePdf(data.currency)}\\)) Tj`);
    contentOps.push("ET");

    // Items row rendering
    let currentY = 570;
    const maxItems = Math.max(data.earnings.length, data.deductions.length, 1);

    for (let i = 0; i < maxItems; i++) {
      const earn = data.earnings[i];
      const ded = data.deductions[i];

      contentOps.push("BT");
      contentOps.push("/F1 9 Tf");
      contentOps.push("0.15 0.15 0.15 rg");

      if (earn) {
        contentOps.push(`55 ${currentY} Td (${escapePdf(earn.name)}) Tj`);
        contentOps.push(`/F2 9 Tf`);
        contentOps.push(`175 0 Td (${escapePdf(formatAmount(earn.amount))}) Tj`);
      }

      if (ded) {
        contentOps.push(`/F1 9 Tf`);
        contentOps.push(`320 ${currentY} Td (${escapePdf(ded.name)}) Tj`);
        contentOps.push(`/F2 9 Tf`);
        contentOps.push(`175 0 Td (${escapePdf(formatAmount(ded.amount))}) Tj`);
      }

      contentOps.push("ET");

      // Draw light separator line
      contentOps.push("0.9 0.9 0.9 RG");
      contentOps.push(`40 ${currentY - 5} 515 0.5 re S`);

      currentY -= 20;
    }

    // Totals Box
    contentOps.push("0.95 0.96 0.97 rg");
    contentOps.push(`40 ${currentY - 15} 250 25 re f`);
    contentOps.push(`40 ${currentY - 15} 250 25 re S`);
    contentOps.push(`305 ${currentY - 15} 250 25 re f`);
    contentOps.push(`305 ${currentY - 15} 250 25 re S`);

    contentOps.push("BT");
    contentOps.push("/F2 9 Tf");
    contentOps.push("0.1 0.1 0.1 rg");
    contentOps.push(`55 ${currentY - 7} Td (Total Gross Earnings:) Tj`);
    contentOps.push(`140 0 Td (${escapePdf(formatAmount(data.grossSalary))}) Tj`);
    contentOps.push(`125 0 Td (Total Deductions:) Tj`);
    contentOps.push(`140 0 Td (${escapePdf(formatAmount(data.totalDeductions))}) Tj`);
    contentOps.push("ET");

    currentY -= 50;

    // Net Take-Home Highlight Box
    contentOps.push("0.02 0.58 0.41 rg");
    contentOps.push(`40 ${currentY - 20} 515 40 re f`);

    contentOps.push("BT");
    contentOps.push("/F2 13 Tf");
    contentOps.push("1 1 1 rg");
    contentOps.push(`55 ${currentY - 7} Td (NET TAKE-HOME SALARY:) Tj`);
    contentOps.push("/F2 15 Tf");
    contentOps.push(`270 0 Td (${escapePdf(formatAmount(data.netSalary))}) Tj`);
    contentOps.push("ET");

    // Footer & Digital Security Verification Note
    contentOps.push("BT");
    contentOps.push("/F1 8 Tf");
    contentOps.push("0.5 0.5 0.5 rg");
    contentOps.push(
      `55 80 Td (This is a system-generated payslip generated from a locked payroll run. No physical signature is required.) Tj`
    );
    contentOps.push(`0 -12 Td (Document Version: ${data.version} | VC Organics HRMS Enterprise Trust Platform) Tj`);
    contentOps.push("ET");

    const streamBody = contentOps.join("\n");
    const streamLength = Buffer.byteLength(streamBody, "utf8");

    // Build standard compliant PDF-1.4 file
    const objects: string[] = [];
    objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
    objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
    objects.push(
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj"
    );
    objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
    objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");
    objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamBody}\nendstream\nendobj`);

    let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets: number[] = [];

    for (const obj of objects) {
      offsets.push(Buffer.byteLength(pdf, "utf8"));
      pdf += `${obj}\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, "utf8");
    pdf += "xref\n";
    pdf += `0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";

    for (const off of offsets) {
      pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
    }

    pdf += "trailer\n";
    pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += "startxref\n";
    pdf += `${xrefOffset}\n`;
    pdf += "%%EOF\n";

    return Buffer.from(pdf, "utf8");
  }
}
