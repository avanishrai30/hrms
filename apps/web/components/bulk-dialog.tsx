"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button, Panel } from "./ui";
import { apiRequest } from "../lib/api";

interface BulkDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  selectedIds: string[];
  operation: 'department' | 'designation' | 'status' | 'archive' | null;
}

export function BulkDialog({ open, onClose, onComplete, selectedIds, operation }: BulkDialogProps) {
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiRequest<Array<{ id: string; name: string }>>("/departments"),
    enabled: open && operation === "department"
  });

  const designations = useQuery({
    queryKey: ["designations"],
    queryFn: () => apiRequest<Array<{ id: string; name: string }>>("/designations"),
    enabled: open && operation === "designation"
  });

  const bulkMutation = useMutation({
    mutationFn: () => apiRequest<{ count: number }>("/employees/bulk", {
      method: "POST",
      body: JSON.stringify({
        employeeIds: selectedIds,
        operation,
        value: operation === 'archive' ? 'ARCHIVED' : value,
        reason
      })
    }),
    onSuccess: () => {
      onComplete();
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

  useEffect(() => {
    if (open) {
      setValue("");
      setReason("");
      bulkMutation.reset();
    }
  }, [open]);

  if (!open || !operation) return null;

  const titles = {
    department: "Change Department",
    designation: "Change Designation",
    status: "Change Status",
    archive: "Archive Employees"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity">
      <Panel className="w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-semibold text-zinc-950 mb-4">{titles[operation]}</h2>
        <p className="text-sm text-zinc-600 mb-4">Selected: {selectedIds.length} employee{selectedIds.length === 1 ? '' : 's'}</p>
        
        <div className="space-y-4">
          {operation === "department" && (
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-zinc-800">Department</span>
              <select
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                <option value="">Select department...</option>
                {departments.data?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          )}

          {operation === "designation" && (
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-zinc-800">Designation</span>
              <select
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                <option value="">Select designation...</option>
                {designations.data?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          )}

          {operation === "status" && (
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-zinc-800">Status</span>
              <select
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                <option value="">Select status...</option>
                <option value="DRAFT">Draft</option>
                <option value="INVITED">Invited</option>
                <option value="ACTIVE">Active</option>
                <option value="PROBATION">Probation</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="NOTICE_PERIOD">Notice period</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          )}

          {operation === "archive" && (
            <p className="text-sm text-danger font-medium p-3 bg-red-50 rounded-control border border-red-100">
              Are you sure you want to archive these employees? They will lose access to the platform.
            </p>
          )}

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-zinc-800">Reason</span>
            <input
              type="text"
              className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary"
              placeholder="Reason for change (min 8 chars)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          
          {bulkMutation.isSuccess && (
            <p className="text-sm text-emerald-700 font-medium">Updated {bulkMutation.data.count} records.</p>
          )}
          
          <div className="flex justify-end gap-2 mt-6 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button 
              variant={operation === 'archive' ? 'danger' : 'primary'}
              onClick={() => bulkMutation.mutate()} 
              disabled={bulkMutation.isPending || reason.length < 8 || (operation !== 'archive' && !value)}
            >
              {bulkMutation.isPending ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
