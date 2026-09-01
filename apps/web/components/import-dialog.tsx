"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Panel } from "./ui";
import { apiRequest } from "../lib/api";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface PreviewResult {
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
  errors: Array<{ row: number; field: string; message: string }>;
  rows: Array<{ row: number; valid: boolean }>;
}

export function ImportDialog({ open, onClose, onComplete }: ImportDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvContent, setCsvContent] = useState("");
  const [rollbackOnError, setRollbackOnError] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewMutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest<PreviewResult>("/employees/import/preview", {
        method: "POST",
        body: JSON.stringify({ csv: text })
      }),
    onSuccess: () => setStep(2)
  });

  const commitMutation = useMutation({
    mutationFn: (csv: string) =>
      apiRequest<{ imported: number; skipped: number; committed: boolean }>("/employees/import/commit", {
        method: "POST",
        body: JSON.stringify({ csv, rollbackOnError })
      }),
    onSuccess: () => {
      setStep(3);
      onComplete();
    }
  });

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setCsvContent("");
      setRollbackOnError(true);
      previewMutation.reset();
      commitMutation.reset();
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setCsvContent(text);
      previewMutation.mutate(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity">
      <Panel className="w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-zinc-950 mb-4">Import Employees</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-panel p-8 text-center bg-surface transition-colors hover:bg-muted">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <p className="text-sm text-zinc-600 mb-4">Drag and drop a CSV file here, or click to select</p>
              <Button onClick={() => fileInputRef.current?.click()} disabled={previewMutation.isPending}>
                {previewMutation.isPending ? "Uploading..." : "Select File"}
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        )}

        {step === 2 && previewMutation.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 border border-border rounded-panel bg-surface">
                <p className="text-sm text-zinc-500">Total Rows</p>
                <p className="text-xl font-semibold">{previewMutation.data.summary.total}</p>
              </div>
              <div className="p-4 border border-border rounded-panel bg-emerald-50">
                <p className="text-sm text-emerald-700">Valid Rows</p>
                <p className="text-xl font-semibold text-emerald-800">{previewMutation.data.summary.valid}</p>
              </div>
              <div className="p-4 border border-border rounded-panel bg-red-50">
                <p className="text-sm text-red-700">Invalid Rows</p>
                <p className="text-xl font-semibold text-red-800">{previewMutation.data.summary.invalid}</p>
              </div>
            </div>

            {previewMutation.data.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-border rounded-panel mb-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs uppercase text-zinc-500 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-medium">Row</th>
                      <th className="px-3 py-2 font-medium">Field</th>
                      <th className="px-3 py-2 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewMutation.data.errors.map((err, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-zinc-600">{err.row}</td>
                        <td className="px-3 py-2 text-zinc-950">{err.field}</td>
                        <td className="px-3 py-2 text-danger">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-zinc-800 cursor-pointer">
              <input type="checkbox" checked={rollbackOnError} onChange={(e) => setRollbackOnError(e.target.checked)} className="rounded-sm border-border w-4 h-4 text-primary" />
              Rollback completely on any error
            </label>

            <div className="flex justify-end gap-2 mt-4 border-t border-border pt-4">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button
                onClick={() => commitMutation.mutate(csvContent)}
                disabled={commitMutation.isPending || (rollbackOnError && previewMutation.data.summary.invalid > 0)}
              >
                {commitMutation.isPending ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && commitMutation.data && (
          <div className="space-y-4 text-center py-8">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 text-xl">
              ✓
            </div>
            <h3 className="text-lg font-medium text-zinc-950">Import Complete</h3>
            <p className="text-sm text-zinc-600">
              Successfully imported {commitMutation.data.imported} records.
              {commitMutation.data.skipped > 0 && ` Skipped ${commitMutation.data.skipped} records.`}
            </p>
            <div className="mt-6 flex justify-center">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
