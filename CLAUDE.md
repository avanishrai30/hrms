# Claude Guide

## Project Intent

VC-WMS is a multi-tenant SaaS HRMS/WMS platform with high-risk modules around payroll, attendance, location verification, and biometric identity verification. VC Organics is Tenant #1.

## Collaboration Protocol

- Treat docs as source of truth until code exists.
- Make small, reviewable changes.
- Preserve isolation from the VC Organics billing platform.
- Preserve tenant isolation in every data, API, cache, queue, storage, audit, and report path.
- Prefer explicit domain services over hidden coupling.
- Write tests before or alongside rule-heavy logic.

## Domain Priorities

1. Attendance integrity
2. Payroll correctness
3. Security and auditability
4. Mobile-first employee experience
5. Admin operational clarity
