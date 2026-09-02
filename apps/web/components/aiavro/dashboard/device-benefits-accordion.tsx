"use client";

import React, { useState } from "react";
import { Laptop, ChevronDown, ShieldCheck, CreditCard, HeartHandshake } from "lucide-react";

interface DeviceBenefitsAccordionProps {
  deviceTag?: string;
  deviceName?: string;
}

export function DeviceBenefitsAccordion({
  deviceTag = "AST-LAP-001",
  deviceName = 'MacBook Pro 16" M3 Max'
}: DeviceBenefitsAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>("devices");

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-2">
      {/* Pension & Statutory Accordion */}
      <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
        <button
          onClick={() => toggle("pension")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-muted/50 transition"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Statutory Pension & EPF</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${
              openSection === "pension" ? "transform rotate-180" : ""
            }`}
          />
        </button>
        {openSection === "pension" && (
          <div className="px-4 pb-4 pt-1 text-xs text-foreground-secondary border-t border-border-subtle space-y-1.5 bg-surface-muted/30">
            <div className="flex justify-between">
              <span className="text-foreground-muted">UAN / EPF Number:</span>
              <span className="font-mono font-semibold">101298475892</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Employer Monthly Contribution:</span>
              <span className="font-semibold text-success">12% Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Devices Accordion */}
      <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
        <button
          onClick={() => toggle("devices")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-muted/50 transition"
        >
          <div className="flex items-center gap-2.5">
            <Laptop className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Assigned Hardware & IT Vault</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${
              openSection === "devices" ? "transform rotate-180" : ""
            }`}
          />
        </button>
        {openSection === "devices" && (
          <div className="px-4 pb-4 pt-2 border-t border-border-subtle bg-surface-muted/30">
            <div className="p-3 rounded-control bg-white border border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-control bg-primary-soft flex items-center justify-center text-primary">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{deviceName}</h4>
                  <p className="text-[10px] text-foreground-muted font-mono">Tag: {deviceTag} • Verified Custody</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-pill bg-success/15 text-success text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Compensation Summary Accordion */}
      <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
        <button
          onClick={() => toggle("comp")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-muted/50 transition"
        >
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Compensation Summary</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${
              openSection === "comp" ? "transform rotate-180" : ""
            }`}
          />
        </button>
        {openSection === "comp" && (
          <div className="px-4 pb-4 pt-1 text-xs text-foreground-secondary border-t border-border-subtle space-y-1.5 bg-surface-muted/30">
            <div className="flex justify-between">
              <span className="text-foreground-muted">Direct Deposit Bank:</span>
              <span className="font-semibold">HDFC Bank (•••• 4829)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Tax Regime:</span>
              <span className="font-semibold">New Regime (FY 2026-27)</span>
            </div>
          </div>
        )}
      </div>

      {/* Employee Benefits Accordion */}
      <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
        <button
          onClick={() => toggle("benefits")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-muted/50 transition"
        >
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Employee Health & Insurance</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${
              openSection === "benefits" ? "transform rotate-180" : ""
            }`}
          />
        </button>
        {openSection === "benefits" && (
          <div className="px-4 pb-4 pt-1 text-xs text-foreground-secondary border-t border-border-subtle space-y-1.5 bg-surface-muted/30">
            <div className="flex justify-between">
              <span className="text-foreground-muted">Group Health Coverage:</span>
              <span className="font-semibold text-primary">₹10,00,000 Sum Insured</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">Dependents Covered:</span>
              <span className="font-semibold">Self + Spouse + 2 Children</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
