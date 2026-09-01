export type FinanceReportFormat = "CSV" | "EXCEL" | "PDF" | "JSON";

export class FinanceReportEngine {
  export(rows: Array<Record<string, string | number | boolean | null>>, format: FinanceReportFormat, title: string) {
    if (format === "JSON") {
      return { format, content: JSON.stringify(rows, null, 2), mimeType: "application/json" };
    }

    const csv = this.toCsv(rows);
    if (format === "PDF") {
      return {
        format,
        content: Buffer.from(`${title}\nGenerated At,${new Date().toISOString()}\n\n${csv}`).toString("base64"),
        mimeType: "application/pdf"
      };
    }

    return {
      format,
      content: format === "EXCEL" ? `\uFEFF${csv}` : csv,
      mimeType: "text/csv"
    };
  }

  private toCsv(rows: Array<Record<string, string | number | boolean | null>>) {
    const headers = rows[0] ? Object.keys(rows[0]) : ["empty"];
    return [headers.join(","), ...rows.map((row) => headers.map((header) => this.csvCell(String(row[header] ?? ""))).join(","))].join("\n");
  }

  private csvCell(value: string) {
    return /[",\n]/.test(value) ? `"${value.replaceAll("\"", "\"\"")}"` : value;
  }
}
