"use client";

import { use, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";

export default function PublicJobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    currentLocation: "",
    experienceYears: "4",
    currentCtc: "1800000",
    expectedCtc: "2400000",
    noticePeriodDays: "30",
    skills: "TypeScript, NestJS, React, PostgreSQL",
    linkedinUrl: "",
    githubUrl: "",
    summary: ""
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setAppliedCode(generatedCode);
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href={"/careers" as Route} className="text-xs font-semibold text-primary hover:underline">
          ← Back to All Openings
        </Link>

        {appliedCode ? (
          <Panel className="p-8 text-center bg-white space-y-4 shadow-md rounded-panel">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              🎉
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Application Submitted Successfully!</h1>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              Thank you for applying for this position at VC Organics. Our talent acquisition team has received your profile and resume.
            </p>
            <div className="p-4 bg-zinc-50 border border-border rounded-panel inline-block">
              <span className="text-xs text-zinc-400 block uppercase">Your Application Tracking Code</span>
              <span className="text-xl font-mono font-bold text-primary">{appliedCode}</span>
            </div>
            <div className="pt-2">
              <Link href={"/candidate-portal" as Route}>
                <Button variant="primary">Track Application in Candidate Portal →</Button>
              </Link>
            </div>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Description Column */}
            <div className="lg:col-span-2 space-y-6">
              <Panel className="p-6 bg-white space-y-4 shadow-xs">
                <div>
                  <Badge tone="success">Full-Time Opening</Badge>
                  <h1 className="mt-2 text-2xl font-extrabold text-zinc-900 capitalize">
                    {slug.replace(/-/g, " ")}
                  </h1>
                  <p className="text-sm text-zinc-500">VC Organics • Engineering • Bengaluru / Hybrid</p>
                </div>

                <div className="border-t border-border pt-4 space-y-4 text-sm text-zinc-700 leading-relaxed">
                  <h2 className="text-base font-bold text-zinc-900">About the Role</h2>
                  <p>
                    We are seeking a talented engineer to build, scale, and optimize next-generation human capital management,
                    intelligent AI copilots, and real-time distributed supply chain systems.
                  </p>

                  <h2 className="text-base font-bold text-zinc-900">Key Responsibilities</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Design high-throughput APIs in NestJS and PostgreSQL with multi-tenant isolation.</li>
                    <li>Develop modern, accessible, and fast web UIs with Next.js App Router and Tailwind CSS.</li>
                    <li>Integrate AI capabilities including vector semantic search, resume entity parsers, and prediction engines.</li>
                    <li>Collaborate with product and operations leads to architect enterprise workflows.</li>
                  </ul>

                  <h2 className="text-base font-bold text-zinc-900">Qualifications</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>3+ years of production experience in TypeScript, Node.js, and React.</li>
                    <li>Strong foundation in relational databases (PostgreSQL / Prisma ORM).</li>
                    <li>Experience with cloud infrastructure (AWS / Docker / Kubernetes).</li>
                  </ul>
                </div>
              </Panel>
            </div>

            {/* Application Form Column */}
            <div>
              <Panel className="p-6 bg-white space-y-4 shadow-xs">
                <h2 className="text-lg font-bold text-zinc-900 border-b border-border pb-2">Apply for Position</h2>
                <form onSubmit={handleApply} className="space-y-3">
                  <Field label="Full Name">
                    <Input
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </Field>
                  <Field label="Email Address">
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Mobile Number">
                    <Input
                      required
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Exp (Yrs)">
                      <Input
                        type="number"
                        value={form.experienceYears}
                        onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                      />
                    </Field>
                    <Field label="Notice (Days)">
                      <Input
                        type="number"
                        value={form.noticePeriodDays}
                        onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="Current Location">
                    <Input
                      value={form.currentLocation}
                      onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                    />
                  </Field>
                  <Field label="Skills / Summary">
                    <Input
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    />
                  </Field>
                  <Field label="Upload Resume (PDF)">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="w-full text-xs text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-panel file:border file:border-border file:text-xs file:font-semibold file:bg-zinc-50 hover:file:bg-zinc-100"
                    />
                  </Field>
                  <div className="pt-2">
                    <Button variant="primary" type="submit" className="w-full">
                      Submit Application 🚀
                    </Button>
                  </div>
                </form>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
