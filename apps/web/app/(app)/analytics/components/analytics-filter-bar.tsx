"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui";

export interface AnalyticsFilterState {
  dateRange: string;
  department: string;
  businessUnit: string;
}

export interface AnalyticsFilterBarProps {
  filters?: AnalyticsFilterState;
  state?: AnalyticsFilterState;
  onFilterChange?: (filters: AnalyticsFilterState) => void;
  onChange?: (filters: AnalyticsFilterState) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  departments?: string[];
  businessUnits?: string[];
}

export function AnalyticsFilterBar({
  filters: propFilters,
  state: propState,
  onFilterChange: propOnFilterChange,
  onChange: propOnChange,
  onRefresh,
  isLoading = false,
  departments = [
    "All Departments",
    "Engineering",
    "Operations",
    "Sales & Marketing",
    "Human Resources",
    "Finance & Accounts",
    "Supply Chain & Logistics"
  ],
  businessUnits = [
    "All Business Units",
    "Enterprise Solutions",
    "Retail & Direct-to-Consumer",
    "Manufacturing & Production",
    "Corporate & Shared Services"
  ]
}: AnalyticsFilterBarProps) {
  const currentFilters = propFilters ?? propState ?? {
    dateRange: "Current Month",
    department: "All Departments",
    businessUnit: "All Business Units"
  };
  const notifyChange = propOnFilterChange ?? propOnChange ?? (() => {});

  const [localRange, setLocalRange] = useState(currentFilters.dateRange);
  const [localDept, setLocalDept] = useState(currentFilters.department);
  const [localBu, setLocalBu] = useState(currentFilters.businessUnit);

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocalRange(val);
    notifyChange({ ...currentFilters, dateRange: val });
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocalDept(val);
    notifyChange({ ...currentFilters, department: val });
  };

  const handleBuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocalBu(val);
    notifyChange({ ...currentFilters, businessUnit: val });
  };

  const handleReset = () => {
    const defaultState: AnalyticsFilterState = {
      dateRange: "Current Month",
      department: "All Departments",
      businessUnit: "All Business Units"
    };
    setLocalRange(defaultState.dateRange);
    setLocalDept(defaultState.department);
    setLocalBu(defaultState.businessUnit);
    notifyChange(defaultState);
  };

  const isFiltered =
    localRange !== "Current Month" ||
    localDept !== "All Departments" ||
    localBu !== "All Business Units";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border bg-surface p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500">Period:</span>
          <select
            value={localRange}
            onChange={handleRangeChange}
            disabled={isLoading}
            className="h-9 rounded-control border border-border bg-surface px-3 text-xs font-medium text-zinc-900 outline-none transition focus:border-primary disabled:opacity-50"
          >
            <option value="Today">Today (Realtime)</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Current Month">Current Month (M-T-D)</option>
            <option value="Last Month">Last Month</option>
            <option value="Current Quarter">Current Quarter (Q-T-D)</option>
            <option value="Year to Date">Year to Date (Y-T-D)</option>
            <option value="Last 12 Months">Last 12 Months</option>
          </select>
        </div>

        {/* Department Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500">Dept:</span>
          <select
            value={localDept}
            onChange={handleDeptChange}
            disabled={isLoading}
            className="h-9 rounded-control border border-border bg-surface px-3 text-xs font-medium text-zinc-900 outline-none transition focus:border-primary disabled:opacity-50"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Business Unit Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500">BU:</span>
          <select
            value={localBu}
            onChange={handleBuChange}
            disabled={isLoading}
            className="h-9 rounded-control border border-border bg-surface px-3 text-xs font-medium text-zinc-900 outline-none transition focus:border-primary disabled:opacity-50"
          >
            {businessUnits.map((bu) => (
              <option key={bu} value={bu}>
                {bu}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 underline transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Refresh and Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-9 px-3 text-xs"
        >
          <span className={`inline-block mr-1.5 ${isLoading ? "animate-spin" : ""}`}>
            ↻
          </span>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
