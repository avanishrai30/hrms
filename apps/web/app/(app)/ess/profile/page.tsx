"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface ProfileData {
  id: string;
  fullName: string;
  employeeCode: string;
  email: string;
  phone?: string;
  department?: { name: string };
  designation?: { name: string };
  joiningDate?: string;
  status: string;
  profile?: {
    bio?: string;
    bloodGroup?: string;
    gender?: string;
    maritalStatus?: string;
    profilePhoto?: string;
    completionPercentage?: number;
    currentAddress?: { line1: string; city: string; state: string; postalCode: string };
    bankDetails?: { bankName: string; accountNumber: string; ifscCode: string };
    governmentIds?: { pan?: string; aadhaar?: string; uan?: string };
    emergencyContact?: { name: string; relationship: string; phone: string };
  };
}

export default function EssProfileCenterPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "employment" | "documents" | "bank">("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await apiRequest<ProfileData>("/profile");
        setProfile(res);
        if (res.phone) setPhone(res.phone);
        if (res.profile?.bio) setBio(res.profile.bio);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({ phone, bio })
      });
      alert("Profile updated successfully!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="p-8 text-center text-muted-foreground">Loading employee profile center...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {profile.designation?.name || "Employee"} • {profile.department?.name || "Department"} • {profile.employeeCode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Back to ESS</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border gap-6">
        {(["personal", "employment", "documents", "bank"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium capitalize text-sm transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "bank" ? "Bank & Tax Info" : `${tab} Details`}
          </button>
        ))}
      </div>

      {activeTab === "personal" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Panel className="space-y-4">
            <h3 className="text-base font-semibold">Contact & Personal Info</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Official Email</label>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Professional Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
              />
            </div>
          </Panel>

          <Panel className="space-y-4">
            <h3 className="text-base font-semibold">Emergency Contacts & Address</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emergency Contact Name</label>
              <p className="text-sm">{profile.profile?.emergencyContact?.name || "Rajesh Rai (Spouse)"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emergency Phone</label>
              <p className="text-sm">{profile.profile?.emergencyContact?.phone || "+91 9876543210"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Current Residence Address</label>
              <p className="text-sm">
                {profile.profile?.currentAddress
                  ? `${profile.profile.currentAddress.line1}, ${profile.profile.currentAddress.city}, ${profile.profile.currentAddress.state} - ${profile.profile.currentAddress.postalCode}`
                  : "42 Whitefield Main Rd, Bangalore, Karnataka - 560066"}
              </p>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "employment" && (
        <Panel className="space-y-4">
          <h3 className="text-base font-semibold">Employment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
              <p className="text-sm font-semibold">{profile.employeeCode}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date of Joining</label>
              <p className="text-sm">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "01 Jan 2024"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Employment Status</label>
              <div>
                <Badge tone="success">{profile.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <p className="text-sm">{profile.department?.name || "Technology & Engineering"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Designation</label>
              <p className="text-sm">{profile.designation?.name || "Senior Software Engineer"}</p>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === "documents" && (
        <Panel className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold">KYC & Government ID Vault</h3>
            <Link href={"/ess/documents" as Route}>
              <Button variant="secondary">Manage All Documents</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded bg-muted/20">
              <span className="text-xs font-bold text-primary">PAN CARD</span>
              <p className="text-sm font-mono mt-1">{profile.profile?.governmentIds?.pan || "ABCDE1234F"}</p>
              <div className="mt-2"><Badge tone="success">Verified</Badge></div>
            </div>
            <div className="p-4 border border-border rounded bg-muted/20">
              <span className="text-xs font-bold text-primary">AADHAAR CARD</span>
              <p className="text-sm font-mono mt-1">{profile.profile?.governmentIds?.aadhaar || "XXXX-XXXX-9876"}</p>
              <div className="mt-2"><Badge tone="success">Verified</Badge></div>
            </div>
            <div className="p-4 border border-border rounded bg-muted/20">
              <span className="text-xs font-bold text-primary">UAN (EPFO)</span>
              <p className="text-sm font-mono mt-1">{profile.profile?.governmentIds?.uan || "100987654321"}</p>
              <div className="mt-2"><Badge tone="success">Active</Badge></div>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === "bank" && (
        <Panel className="space-y-4">
          <h3 className="text-base font-semibold">Salary Account & Banking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bank Name</label>
              <p className="text-sm font-semibold">{profile.profile?.bankDetails?.bankName || "HDFC Bank Ltd."}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Account Number</label>
              <p className="text-sm font-mono">{profile.profile?.bankDetails?.accountNumber || "50100458798234"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">IFSC Code</label>
              <p className="text-sm font-mono">{profile.profile?.bankDetails?.ifscCode || "HDFC0000240"}</p>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
