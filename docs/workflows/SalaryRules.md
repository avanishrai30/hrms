# Salary Rules

## Principle

Salary calculation is attendance-driven, tenant-specific, and reproducible. Every payroll item stores a calculation snapshot so future rule changes do not alter historical payroll.

## Monthly Salary Formula

Example:

- Monthly salary: `18000`
- Working days: `26`
- Daily rate: `18000 / 26`

Base formula:

```text
dailyRate = monthlySalary / configuredWorkingDays
attendancePay = payableDays * dailyRate
netSalary = attendancePay - deductions + adjustments
```

## Attendance Multipliers

Default configurable tenant rules:

- Present: `1.0`
- Work From Home: `1.0`
- Paid Leave: `1.0`
- Holiday: `1.0`
- Week Off: `1.0` when policy includes it as paid
- Half Day: `0.5`
- Unpaid Leave: `0.0`
- Absent: `0.0`

## Late Policy

Late policy must be configurable per tenant:

- Grace minutes
- Allowed late count per month
- Penalty mode
- Penalty value

Supported penalty modes:

- No penalty
- Fixed amount
- Half-day deduction
- Daily-rate fraction

## Leave Policy

Leave policy must distinguish per tenant:

- Approved paid leave
- Approved unpaid leave
- Pending leave
- Rejected leave
- Emergency leave

Pending or rejected leave does not automatically count as paid leave.

## Payroll Run

1. HR Admin or Tenant Owner starts payroll generation.
2. API locks tenant, month, and year as a draft payroll run.
3. System reads attendance, leave, salary profiles, and active salary rule for that tenant only.
4. System creates tenant-scoped payroll items with calculation snapshots.
5. HR reviews exceptions.
6. Tenant Owner or authorized HR Admin approves payroll.
7. Payroll run can be marked paid.

## Correction Rules

- Attendance corrections after payroll generation require payroll recalculation or adjustment entry.
- Approved payroll must not be silently mutated.
- Paid payroll is immutable except through explicit adjustment records in a later payroll cycle.

## Tests Required

- Absent day creates no pay.
- Half day creates 50 percent pay.
- Paid leave creates full pay.
- Unpaid leave creates no pay.
- Late penalties apply after grace policy.
- Payroll item remains stable after salary rule changes.
- Cross-tenant attendance cannot affect another tenant payroll run.
