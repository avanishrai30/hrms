"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

const schema = z.object({
  employeeCode: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  joiningDate: z.string().min(10),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]),
  salaryType: z.enum(["MONTHLY", "DAILY", "HOURLY"]),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY", ""]).optional(),
  preferredName: z.string().optional(),
  managerEmployeeId: z.string().uuid().optional().or(z.literal(""))
});

type EmployeeForm = z.infer<typeof schema>;

export default function EmployeeCreatePage() {
  const router = useRouter();
  const [createdEmployee, setCreatedEmployee] = useState<{ id: string; managerEmployeeId?: string | null; departmentId?: string | null; designationId?: string | null; memberships?: unknown[]; locationAssignments?: unknown[]; shiftAssignments?: unknown[] } | null>(null);
  const form = useForm<EmployeeForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      employmentType: "FULL_TIME",
      salaryType: "MONTHLY",
      gender: ""
    }
  });

  const departments = useQuery({ queryKey: ['departments'], queryFn: () => apiRequest<Array<{id: string; name: string; code: string}>>('/departments') });
  const designations = useQuery({ queryKey: ['designations'], queryFn: () => apiRequest<Array<{id: string; name: string; code: string; department: {name: string}}>>('/designations') });

  const createEmployee = useMutation({
    mutationFn: (values: EmployeeForm) => {
      const payload = { ...values, joiningDate: new Date(values.joiningDate).toISOString() };
      if (payload.dateOfBirth) payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();
      if (!payload.managerEmployeeId) delete payload.managerEmployeeId;
      if (!payload.gender) delete payload.gender;
      return apiRequest<{ id: string; managerEmployeeId?: string | null; departmentId?: string | null; designationId?: string | null; memberships?: unknown[]; locationAssignments?: unknown[]; shiftAssignments?: unknown[] }>("/employees", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: (employee) => setCreatedEmployee(employee)
  });

  if (createdEmployee) {
    const checklist = [
      ["Manager", Boolean(createdEmployee.managerEmployeeId)],
      ["Location", Boolean(createdEmployee.locationAssignments?.length)],
      ["Department / Team", Boolean(createdEmployee.departmentId)],
      ["Designation", Boolean(createdEmployee.designationId)],
      ["Shift", Boolean(createdEmployee.shiftAssignments?.length)],
      ["Role", Boolean(createdEmployee.memberships?.length)],
      ["Login Account", Boolean(createdEmployee.memberships?.length)]
    ];
    return (
      <div className="mx-auto grid max-w-3xl gap-6 p-4 md:p-6 lg:p-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Employee created</h1>
          <p className="mt-1 text-sm text-zinc-600">Continue setup from the employee record. Login account creation is optional.</p>
        </header>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-950">Setup checklist</h2>
          </div>
          <div className="grid gap-2 p-5 sm:grid-cols-2">
            {checklist.map(([label, ready]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-control border border-border px-3 py-2 text-xs">
                <span className="font-medium text-zinc-800">{label}</span>
                <span className={ready ? "font-semibold text-emerald-700" : "font-semibold text-zinc-500"}>{ready ? "Ready" : "Needs setup"}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setCreatedEmployee(null)}>Create another</Button>
            <Link href={`/employees/${createdEmployee.id}` as Route} className="inline-flex h-10 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover">
              Continue setup
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Create employee</h1>
        <p className="mt-1 text-sm text-zinc-600">Add foundation profile details. Attendance enrollment comes in a later sprint.</p>
      </header>
      <Panel>
        <form className="grid gap-5" onSubmit={form.handleSubmit((values) => createEmployee.mutate(values))}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Employee code" error={form.formState.errors.employeeCode?.message}>
              <Input {...form.register("employeeCode")} />
            </Field>
            <Field label="Full name" error={form.formState.errors.fullName?.message}>
              <Input {...form.register("fullName")} />
            </Field>
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input {...form.register("email")} type="email" />
            </Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} />
            </Field>
            
            <Field label="Department" error={form.formState.errors.departmentId?.message}>
              <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...form.register("departmentId")}>
                <option value="">Select department</option>
                {departments.data?.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Designation" error={form.formState.errors.designationId?.message}>
              <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...form.register("designationId")}>
                <option value="">Select designation</option>
                {designations.data?.map(desig => (
                  <option key={desig.id} value={desig.id}>{desig.name} ({desig.department?.name})</option>
                ))}
              </select>
            </Field>

            <Field label="Joining date" error={form.formState.errors.joiningDate?.message}>
              <Input {...form.register("joiningDate")} type="date" />
            </Field>
            <Field label="Employment type" error={form.formState.errors.employmentType?.message}>
              <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...form.register("employmentType")}>
                <option value="FULL_TIME">Full time</option>
                <option value="PART_TIME">Part time</option>
                <option value="CONTRACT">Contract</option>
                <option value="TEMPORARY">Temporary</option>
              </select>
            </Field>
          </div>
          <Field label="Salary type" error={form.formState.errors.salaryType?.message}>
            <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...form.register("salaryType")}>
              <option value="MONTHLY">Monthly</option>
              <option value="DAILY">Daily</option>
              <option value="HOURLY">Hourly</option>
            </select>
          </Field>

          <details className="group mt-2">
            <summary className="cursor-pointer text-sm font-medium text-zinc-950">Personal details (Optional)</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Preferred name" error={form.formState.errors.preferredName?.message}>
                <Input {...form.register("preferredName")} />
              </Field>
              <Field label="Date of birth" error={form.formState.errors.dateOfBirth?.message}>
                <Input {...form.register("dateOfBirth")} type="date" />
              </Field>
              <Field label="Gender" error={form.formState.errors.gender?.message}>
                <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...form.register("gender")}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </Field>
            </div>
          </details>

          <details className="group mt-2">
            <summary className="cursor-pointer text-sm font-medium text-zinc-950">Manager (Optional)</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Manager employee ID" error={form.formState.errors.managerEmployeeId?.message}>
                <Input {...form.register("managerEmployeeId")} placeholder="UUID of manager" />
              </Field>
            </div>
          </details>

          {createEmployee.isError ? <p className="text-sm text-danger">Employee could not be created. Check tenant setup and permissions.</p> : null}
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button disabled={createEmployee.isPending} type="submit">
              {createEmployee.isPending ? "Creating" : "Create employee"}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
