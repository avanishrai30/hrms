"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { formatMoney } from "../../../../lib/money";
import type { EmployeeCompensationView } from "@vc-wms/shared-types";

export default function EmployeeCompensationPage() {
  const [compensation, setCompensation] = useState<EmployeeCompensationView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCompensation() {
      try {
        setIsLoading(true);
        setCompensation(await apiRequest<EmployeeCompensationView>("/compensation/me"));
      } catch {
        setCompensation(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCompensation();
  }, []);

  const fixedMonthly =
    compensation?.items
      ?.filter((item) => item.component?.type === "EARNING" && item.component?.isFixed)
      .reduce((sum, item) => sum + item.monthlyAmount, 0) ?? 0;
  const variableMonthly =
    compensation?.items
      ?.filter((item) => item.component?.category === "BONUS" || !item.component?.isFixed)
      .reduce((sum, item) => sum + item.monthlyAmount, 0) ?? 0;
  const fixedPercentage =
    compensation && compensation.monthlyCtc > 0
      ? `${Math.round((fixedMonthly / compensation.monthlyCtc) * 100)}%`
      : "—";
  const variablePercentage =
    compensation && compensation.monthlyCtc > 0
      ? `${Math.round((variableMonthly / compensation.monthlyCtc) * 100)}%`
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={"/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Payroll Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Salary Structure & Total Rewards</h1>
          <p className="text-sm text-slate-600">
            Your active compensation structure, salary components, and employer statutory benefits.
          </p>
        </div>
        <Button variant="secondary" disabled={!compensation}>Download Annexure</Button>
      </div>

      {isLoading ? (
        <Panel className="p-12 text-center text-sm text-slate-500">Loading compensation...</Panel>
      ) : !compensation ? (
        <Panel className="p-12 text-center text-sm text-slate-500">
          Active compensation has not been published for this employee.
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono">
            <Panel className="p-4 border-l-4 border-l-primary">
              <span className="text-xs font-sans font-medium text-slate-500 uppercase">Annual CTC</span>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {formatMoney(compensation.annualCtc, compensation.currency)}
              </div>
            </Panel>
            <Panel className="p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs font-sans font-medium text-slate-500 uppercase">Monthly CTC</span>
              <div className="mt-1 text-2xl font-bold text-emerald-700">
                {formatMoney(compensation.monthlyCtc, compensation.currency)}
              </div>
            </Panel>
            <Panel className="p-4 border-l-4 border-l-blue-500">
              <span className="text-xs font-sans font-medium text-slate-500 uppercase">Fixed Component</span>
              <div className="mt-1 text-2xl font-bold text-blue-700">{fixedPercentage}</div>
            </Panel>
            <Panel className="p-4 border-l-4 border-l-amber-500">
              <span className="text-xs font-sans font-medium text-slate-500 uppercase">Variable Component</span>
              <div className="mt-1 text-2xl font-bold text-amber-700">{variablePercentage}</div>
            </Panel>
          </div>

          <Panel className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">CTC Line Item Composition</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Component Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Monthly</th>
                    <th className="py-3 px-4">Annual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {compensation.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                        {item.component?.name ?? "Component"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge tone={item.component?.type === "EARNING" ? "success" : "neutral"}>
                          {item.component?.category ?? "CUSTOM"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {formatMoney(item.monthlyAmount, compensation.currency)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-primary">
                        {formatMoney(item.annualAmount, compensation.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
