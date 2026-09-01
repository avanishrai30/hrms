"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { getOfflineData, saveOfflineData } from "../../../lib/offline-storage";
import type { EmployeeProfileView } from "@vc-wms/shared-types";

export default function ProfileViewPage() {
  const [profile, setProfile] = useState<EmployeeProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await apiRequest<EmployeeProfileView>("/profile");
        setProfile(res);
        saveOfflineData("profile_view", res);
      } catch (err: unknown) {
        const cached = getOfflineData<EmployeeProfileView>("profile_view");
        if (cached) {
          setProfile(cached);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading && !profile) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="h-28 bg-muted animate-pulse rounded-panel" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-muted animate-pulse rounded-panel" />
          <div className="h-48 bg-muted animate-pulse rounded-panel" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <Panel className="p-6 md:p-8 bg-gradient-to-r from-surface to-muted/40 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl font-bold text-primary">
              {profile?.fullName.charAt(0) ?? "U"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-950">{profile?.fullName}</h1>
                <Badge tone="success">{profile?.status}</Badge>
              </div>
              <p className="text-sm font-medium text-zinc-600">
                {profile?.designationTitle} • {profile?.departmentName}
              </p>
              <p className="text-xs text-zinc-400">
                Employee Code: <span className="font-mono">{profile?.employeeCode}</span> • Joined{" "}
                {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={"/id-card" as Route}>
              <Button variant="secondary">🪪 ID Card</Button>
            </Link>
            <Link href={"/profile/edit" as Route}>
              <Button variant="primary">✏️ Edit Profile</Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span>Profile Completion</span>
              <span>{profile?.profileCompletionPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${profile?.profileCompletionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Personal Details</h2>
          <div className="space-y-2.5 text-sm divide-y divide-border/40">
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Official Email</span>
              <span className="font-medium text-zinc-900">{profile?.email}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Personal Email</span>
              <span className="font-medium text-zinc-900">{profile?.personalEmail || "--"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Phone Number</span>
              <span className="font-medium text-zinc-900">{profile?.phone || "--"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Date of Birth</span>
              <span className="font-medium text-zinc-900">
                {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "--"}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Gender</span>
              <span className="font-medium text-zinc-900">{profile?.gender || "--"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Blood Group</span>
              <span className="font-medium text-zinc-900">{profile?.bloodGroup || "--"}</span>
            </div>
          </div>
        </Panel>

        {/* Organization Details */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Organization Hierarchy</h2>
          <div className="space-y-2.5 text-sm divide-y divide-border/40">
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Business Unit</span>
              <span className="font-medium text-zinc-900">{profile?.businessUnitName || "Corporate"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Region</span>
              <span className="font-medium text-zinc-900">{profile?.regionName || "Headquarters"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Team</span>
              <span className="font-medium text-zinc-900">{profile?.teamName || "Core"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Reporting Manager</span>
              <span className="font-medium text-zinc-900">{profile?.managerName || "None (Executive)"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-zinc-500">Employment Type</span>
              <span className="font-medium text-zinc-900">{profile?.employmentType}</span>
            </div>
          </div>
        </Panel>

        {/* Emergency Contacts */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Emergency Contacts</h2>
          {profile?.emergencyContact ? (
            <div className="space-y-2.5 text-sm divide-y divide-border/40">
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Contact Name</span>
                <span className="font-medium text-zinc-900">{profile.emergencyContact.name}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Relationship</span>
                <span className="font-medium text-zinc-900">{profile.emergencyContact.relationship}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Phone</span>
                <span className="font-medium text-zinc-900">{profile.emergencyContact.phone}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No emergency contact configured yet.</p>
          )}
        </Panel>

        {/* Address Information */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Address Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Current Address</p>
              {profile?.currentAddress ? (
                <p className="font-medium text-zinc-800 mt-1">
                  {profile.currentAddress.line1}
                  {profile.currentAddress.line2 ? `, ${profile.currentAddress.line2}` : ""},{" "}
                  {profile.currentAddress.city}, {profile.currentAddress.state} -{" "}
                  {profile.currentAddress.postalCode}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 mt-1">Not provided</p>
              )}
            </div>
            <div className="pt-2 border-t border-border/40">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Permanent Address</p>
              {profile?.permanentAddress ? (
                <p className="font-medium text-zinc-800 mt-1">
                  {profile.permanentAddress.line1}
                  {profile.permanentAddress.line2 ? `, ${profile.permanentAddress.line2}` : ""},{" "}
                  {profile.permanentAddress.city}, {profile.permanentAddress.state} -{" "}
                  {profile.permanentAddress.postalCode}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 mt-1">Same as current address</p>
              )}
            </div>
          </div>
        </Panel>

        {/* Bank & Payment Information */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Bank Details</h2>
          {profile?.bankDetails ? (
            <div className="space-y-2.5 text-sm divide-y divide-border/40">
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Bank Name</span>
                <span className="font-medium text-zinc-900">{profile.bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Account Number</span>
                <span className="font-mono font-medium text-zinc-900">
                  •••• {profile.bankDetails.accountNumber.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">IFSC Code</span>
                <span className="font-mono font-medium text-zinc-900">{profile.bankDetails.ifscCode}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No bank details mapped.</p>
          )}
        </Panel>

        {/* Government Identifiers */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Government Identifiers</h2>
          {profile?.governmentIds ? (
            <div className="space-y-2.5 text-sm divide-y divide-border/40">
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">PAN</span>
                <span className="font-mono font-medium text-zinc-900">
                  {profile.governmentIds.pan ? `•••• ${profile.governmentIds.pan.slice(-4)}` : "--"}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">Aadhaar</span>
                <span className="font-mono font-medium text-zinc-900">
                  {profile.governmentIds.aadhaar ? `•••• •••• ${profile.governmentIds.aadhaar.slice(-4)}` : "--"}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-zinc-500">UAN (PF)</span>
                <span className="font-mono font-medium text-zinc-900">{profile.governmentIds.uan || "--"}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No statutory IDs recorded.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
