"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Panel } from "./ui";
import { apiRequest } from "../lib/api";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ExportResult {
  format: string;
  mimeType: string;
  fileName: string;
  content: string;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<"CSV" | "EXCEL">("CSV");

  const exportMutation = useMutation({
    mutationFn: (selectedFormat: "CSV" | "EXCEL") =>
      apiRequest<ExportResult>("/employees/export", {
        method: "POST",
        body: JSON.stringify({ format: selectedFormat })
      }),
    onSuccess: (data) => {
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onClose();
    }
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity">
      <Panel className="w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-semibold text-zinc-950 mb-4">Export Employees</h2>
        
        <div className="space-y-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-zinc-800">Format</span>
            <select
              className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary"
              value={format}
              onChange={(e) => setFormat(e.target.value as "CSV" | "EXCEL")}
            >
              <option value="CSV">CSV</option>
              <option value="EXCEL">Excel-ready CSV</option>
            </select>
          </label>
          
          <div className="flex justify-end gap-2 mt-6 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={() => exportMutation.mutate(format)} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
