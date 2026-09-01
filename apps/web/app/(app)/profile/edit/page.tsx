"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { Button, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { isOnline, queueOfflineAction } from "../../../../lib/offline-storage";
import type { EmployeeProfileView } from "@vc-wms/shared-types";

export default function ProfileEditPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [preferredName, setPreferredName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<EmployeeProfileView>("/profile");
        setPreferredName(res.preferredName || "");
        setPersonalEmail(res.personalEmail || "");
        setPhone(res.phone || "");
        setBio(res.bio || "");
        setBloodGroup(res.bloodGroup || "O+");
        if (res.emergencyContact) {
          setEmergencyName(res.emergencyContact.name || "");
          setEmergencyPhone(res.emergencyContact.phone || "");
          setEmergencyRelation(res.emergencyContact.relationship || "");
        }
        if (res.currentAddress) {
          setAddressLine1(res.currentAddress.line1 || "");
          setAddressCity(res.currentAddress.city || "");
          setAddressState(res.currentAddress.state || "");
          setAddressZip(res.currentAddress.postalCode || "");
        }
      } catch (err: unknown) {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load profile details"
        });
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const payload = {
      preferredName,
      personalEmail,
      phone,
      bio,
      bloodGroup,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relationship: emergencyRelation
      },
      currentAddress: {
        line1: addressLine1,
        city: addressCity,
        state: addressState,
        postalCode: addressZip,
        country: "India"
      }
    };

    if (!isOnline()) {
      queueOfflineAction("/profile", "PUT", payload);
      setStatusMsg({
        type: "success",
        text: "Offline mode: Profile updates queued and will sync when connectivity returns."
      });
      setSaving(false);
      return;
    }

    try {
      await apiRequest<EmployeeProfileView>("/profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      setStatusMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => router.push("/profile" as Route), 1200);
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile"
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Edit Employee Profile</h1>
          <p className="text-sm text-zinc-500">
            Update your personal contact details, bio, and emergency information
          </p>
        </div>
        <Link href={"/profile" as Route}>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Personal Info */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Preferred / Nick Name</label>
              <Input
                value={preferredName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferredName(e.target.value)}
                placeholder="e.g. Johnny"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Personal Email</label>
              <Input
                type="email"
                value={personalEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersonalEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Primary Phone Number</label>
              <Input
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBloodGroup(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Bio / About Me</label>
            <textarea
              value={bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Share a brief introduction with your colleagues..."
            />
          </div>
        </Panel>

        {/* Emergency Contact */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Emergency Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Contact Person Name</label>
              <Input
                value={emergencyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmergencyName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Relationship</label>
              <Input
                value={emergencyRelation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmergencyRelation(e.target.value)}
                placeholder="e.g. Spouse, Parent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Emergency Phone</label>
              <Input
                value={emergencyPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmergencyPhone(e.target.value)}
                placeholder="+91..."
              />
            </div>
          </div>
        </Panel>

        {/* Current Address */}
        <Panel className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900">Current Residential Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Street Address / Building</label>
              <Input
                value={addressLine1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressLine1(e.target.value)}
                placeholder="Flat 4B, Green Towers..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">City</label>
                <Input
                  value={addressCity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">State</label>
                <Input
                  value={addressState}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Postal PIN Code</label>
                <Input
                  value={addressZip}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressZip(e.target.value)}
                  placeholder="PIN"
                />
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex justify-end gap-3">
          <Link href={"/profile" as Route}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Profile Details"}
          </Button>
        </div>
      </form>
    </div>
  );
}
