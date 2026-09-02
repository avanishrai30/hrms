"use client";

import React, { useState } from "react";
import {
  Download,
  RotateCw,
  ShieldCheck,
  QrCode,
  AlertCircle
} from "lucide-react";
import { useIdCard } from "../../../lib/queries/use-ess-queries";
import { useSessionStore } from "../../../lib/session-store";
import { downloadAuthenticatedFile } from "../../../lib/api";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

export default function DigitalIdCardPage() {
  const permissions = useSessionStore((state) => state.permissions) || [];
  const hasPermission = permissions.length === 0 || permissions.includes("idcard.view") || permissions.includes("ess.read");

  const [flipped, setFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: card, isLoading, isError, refetch } = useIdCard(hasPermission);

  const handleDownload = async () => {
    try {
      setDownloadError(null);
      setDownloading(true);
      await downloadAuthenticatedFile("/id-card/download", "id_badge.pdf");
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : "Failed to download ID badge PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-md mx-auto flex flex-col items-center space-y-4 animate-pulse">
        <SkeletonLoader className="h-6 w-48" />
        <SkeletonLoader className="w-80 h-[460px] rounded-panel" />
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-foreground">Digital Credential Unavailable</h2>
          <p className="text-xs text-foreground-muted">
            Unable to render employee ID badge for current profile session.
          </p>
          <button onClick={() => refetch()} className="px-4 py-2 rounded-control bg-primary text-white text-xs font-semibold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const initial = (card.fullName || "U").charAt(0).toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 flex flex-col items-center animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Digital Identity Credential</h1>
        <p className="text-xs text-foreground-muted">Official verified workplace badge with dynamic credential verification</p>
      </div>

      {downloadError && (
        <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* ID Badge Card with Flip Effect */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-80 h-[480px] cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`relative w-full h-full rounded-panel shadow-2xl transition-all duration-500 transform-style-3d border border-white/60 ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden rounded-panel bg-gradient-to-b from-[#18153B] via-[#261A4E] to-[#120E2E] text-white p-6 flex flex-col justify-between overflow-hidden">
            {/* Top Lanyard Notch & Tenant Brand */}
            <div>
              <div className="w-14 h-2 rounded-pill bg-white/20 mx-auto mb-4" />
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-xs font-black tracking-widest text-white uppercase">
                    {card.companyName || "—"}
                  </h2>
                  <p className="text-[9px] text-purple-300/70 font-mono">Workforce OS</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-purple-300" />
              </div>
            </div>

            {/* Photo & Profile Identity */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-panel overflow-hidden border-2 border-purple-300/40 bg-white/10 flex items-center justify-center text-3xl font-black text-white shadow-lg">
                {card.profilePhoto ? (
                  <img src={card.profilePhoto} alt={card.fullName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{card.fullName}</h3>
                <p className="text-xs font-semibold text-purple-200 mt-0.5">{card.designation || "—"}</p>
                <p className="text-[11px] text-purple-300/70">{card.department || "—"}</p>
              </div>
            </div>

            {/* Bottom ID Code & Chip */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-purple-300/70 uppercase block">Employee Code</span>
                <span className="text-xs font-mono font-bold text-white">{card.employeeCode || "—"}</span>
              </div>

              <div className="px-2 py-1 rounded bg-white/10 text-[9px] font-mono font-bold text-purple-200">
                ACTIVE
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-panel bg-gradient-to-b from-[#18153B] via-[#261A4E] to-[#120E2E] text-white p-6 flex flex-col justify-between">
            <div>
              <div className="w-14 h-2 rounded-pill bg-white/20 mx-auto mb-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-center pb-2 border-b border-white/10">
                Credential Verification
              </h3>
            </div>

            {/* Back Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-purple-300/70">Joined Date</span>
                <span className="font-semibold text-white">
                  {card.joiningDate ? new Date(card.joiningDate).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-purple-300/70">Blood Group</span>
                <span className="font-semibold text-white">{card.bloodGroup || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-purple-300/70">Emergency Contact</span>
                <span className="font-semibold text-white font-mono">{card.emergencyContactPhone || "—"}</span>
              </div>
            </div>

            {/* Verification Block */}
            <div className="text-center pt-3 border-t border-white/10">
              {card.qrCodePayload ? (
                <div>
                  <div className="w-16 h-16 rounded bg-white text-zinc-950 mx-auto flex items-center justify-center p-1 mb-2">
                    <QrCode className="w-12 h-12" />
                  </div>
                  <p className="text-[10px] text-purple-300/70 font-mono">Verified Credential Payload</p>
                </div>
              ) : (
                <p className="text-[10px] text-purple-300/70 font-mono py-4">Digital verification not available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFlipped(!flipped)}
          className="px-4 py-2 rounded-control bg-surface-raised border border-border-subtle hover:bg-surface-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5 shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Flip Credential</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? "Downloading..." : "Download PDF Badge"}</span>
        </button>
      </div>
    </div>
  );
}
