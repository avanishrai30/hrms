"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { Button, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { isOnline, queueOfflineAction } from "../../../../lib/offline-storage";
import type { EmployeeRequestType, EmployeeRequestView } from "@vc-wms/shared-types";

export default function NewEmployeeRequestPage() {
  const router = useRouter();
  const [requestType, setRequestType] = useState<EmployeeRequestType>("ADDRESS_CHANGE");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dynamic payload fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");

  const [contactPhone, setContactPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");

  const [customDetails, setCustomDetails] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setStatusMsg({ type: "error", text: "Please provide a reason for the request." });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    let payload: Record<string, unknown> = {};
    if (requestType === "ADDRESS_CHANGE") {
      payload = {
        currentAddress: {
          line1: addressLine1,
          city: addressCity,
          state: addressState,
          postalCode: addressZip,
          country: "India"
        }
      };
    } else if (requestType === "BANK_CHANGE") {
      payload = {
        bankDetails: {
          bankName,
          accountNumber: bankAccount,
          ifscCode: bankIfsc,
          accountType: "SALARY"
        }
      };
    } else if (requestType === "PERSONAL_INFO_CORRECTION") {
      payload = {
        phone: contactPhone,
        personalEmail
      };
    } else {
      payload = {
        details: customDetails
      };
    }

    const requestBody = {
      requestType,
      reason,
      payload
    };

    if (!isOnline()) {
      queueOfflineAction("/requests", "POST", requestBody);
      setStatusMsg({
        type: "success",
        text: "Offline Mode: Request queued for submission when connection is restored."
      });
      setSubmitting(false);
      setTimeout(() => router.push("/requests" as Route), 1200);
      return;
    }

    try {
      await apiRequest<EmployeeRequestView>("/requests", {
        method: "POST",
        body: JSON.stringify(requestBody)
      });
      setStatusMsg({ type: "success", text: "Request submitted successfully! Approvers notified." });
      setTimeout(() => router.push("/requests" as Route), 1200);
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit request"
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Submit Self-Service Request</h1>
          <p className="text-sm text-zinc-500">Choose a category and provide updated details for review</p>
        </div>
        <Link href={"/requests" as Route}>
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-control text-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-700"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Panel className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Request Category</label>
            <select
              value={requestType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRequestType(e.target.value as EmployeeRequestType)}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ADDRESS_CHANGE">Residential Address Update</option>
              <option value="BANK_CHANGE">Salary Bank Account Change</option>
              <option value="PERSONAL_INFO_CORRECTION">Personal Contact Correction</option>
              <option value="SHIFT_CHANGE">Shift Timing Adjustment</option>
              <option value="DOCUMENT_UPDATE">Document & ID Update</option>
              <option value="CUSTOM">General HR Request</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Reason / Business Justification</label>
            <Input
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
              placeholder="Explain why this change is needed..."
              required
            />
          </div>
        </Panel>

        {/* Dynamic Category Specific Inputs */}
        {requestType === "ADDRESS_CHANGE" && (
          <Panel className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900">New Address Information</h2>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Street Address / Flat / Building</label>
              <Input
                value={addressLine1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressLine1(e.target.value)}
                placeholder="e.g. 102 Crystal Apts"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">City</label>
                <Input
                  value={addressCity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">State</label>
                <Input
                  value={addressState}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressState(e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">PIN Code</label>
                <Input
                  value={addressZip}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressZip(e.target.value)}
                  placeholder="560001"
                  required
                />
              </div>
            </div>
          </Panel>
        )}

        {requestType === "BANK_CHANGE" && (
          <Panel className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900">New Bank Account Details</h2>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Bank Name</label>
              <Input
                value={bankName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Account Number</label>
                <Input
                  value={bankAccount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankAccount(e.target.value)}
                  placeholder="Account number"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">IFSC Code</label>
                <Input
                  value={bankIfsc}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankIfsc(e.target.value)}
                  placeholder="e.g. HDFC0001234"
                  required
                />
              </div>
            </div>
          </Panel>
        )}

        {requestType === "PERSONAL_INFO_CORRECTION" && (
          <Panel className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900">Updated Contact Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">New Phone Number</label>
                <Input
                  value={contactPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactPhone(e.target.value)}
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">New Personal Email</label>
                <Input
                  type="email"
                  value={personalEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonalEmail(e.target.value)}
                  placeholder="name@email.com"
                />
              </div>
            </div>
          </Panel>
        )}

        {requestType === "CUSTOM" && (
          <Panel className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900">Request Specifications</h2>
            <textarea
              value={customDetails}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomDetails(e.target.value)}
              rows={4}
              className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Provide complete description and requirements for HR..."
              required
            />
          </Panel>
        )}

        <div className="flex justify-end gap-3">
          <Link href={"/requests" as Route}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </form>
    </div>
  );
}
