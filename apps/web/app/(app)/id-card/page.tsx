"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { getOfflineData, saveOfflineData } from "../../../lib/offline-storage";
import type { IdCardDataView } from "@vc-wms/shared-types";

export default function DigitalIdCardPage() {
  const [card, setCard] = useState<IdCardDataView | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCard() {
      try {
        setLoading(true);
        const res = await apiRequest<IdCardDataView>("/id-card");
        setCard(res);
        saveOfflineData("id_card_data", res);
      } catch (err: unknown) {
        const cached = getOfflineData<IdCardDataView>("id_card_data");
        if (cached) {
          setCard(cached);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load ID card");
        }
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, []);

  if (loading && !card) {
    return (
      <div className="p-8 flex justify-center">
        <div className="h-96 w-64 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="p-8 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-zinc-950">Digital Identity Card</h1>
        <p className="text-sm text-zinc-500">Official verified digital workplace badge with NFC / QR verification</p>
      </div>

      {/* ID Badge Presentation Container */}
      <div className="relative cursor-pointer select-none" onClick={() => setFlipped(!flipped)}>
        <div
          className={`w-80 h-[480px] rounded-3xl p-6 text-white shadow-2xl transition-all duration-500 relative flex flex-col justify-between overflow-hidden border border-white/10 ${
            flipped
              ? "bg-gradient-to-br from-zinc-900 via-zinc-800 to-black"
              : "bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950"
          }`}
        >
          {/* Card Top Accent */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-sm tracking-wider uppercase">{card?.companyName}</p>
              <p className="text-[10px] text-emerald-200 tracking-widest uppercase">Digital Workplace Badge</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              VC
            </div>
          </div>

          {!flipped ? (
            /* Front Face */
            <>
              <div className="flex flex-col items-center text-center space-y-3 my-auto">
                <div className="h-28 w-28 rounded-2xl bg-white/10 border-2 border-white/30 overflow-hidden flex items-center justify-center text-4xl font-bold shadow-inner">
                  {card?.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{card?.fullName}</h3>
                  <p className="text-xs text-emerald-200 font-medium">{card?.designation}</p>
                  <p className="text-[11px] text-white/70">{card?.department}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-white/20 pt-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Employee ID</span>
                  <span className="font-mono font-bold tracking-wider">{card?.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Blood Group</span>
                  <span className="font-bold">{card?.bloodGroup || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Joining Date</span>
                  <span>{card?.joiningDate ? new Date(card.joiningDate).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </>
          ) : (
            /* Back Face with QR Code Verification */
            <>
              <div className="flex flex-col items-center justify-center space-y-4 my-auto text-center">
                <div className="p-3 bg-white rounded-2xl shadow-lg">
                  {/* Visual QR Code Representation */}
                  <div className="h-32 w-32 bg-zinc-950 rounded-lg p-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="h-8 w-8 bg-white rounded-sm" />
                      <div className="h-8 w-8 bg-white rounded-sm" />
                    </div>
                    <div className="text-[9px] text-emerald-400 font-mono font-bold">{card?.employeeCode}</div>
                    <div className="flex justify-between">
                      <div className="h-8 w-8 bg-white rounded-sm" />
                      <div className="h-4 w-4 bg-white rounded-full self-end" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 font-medium max-w-[200px]">
                  Scan to verify authentic identity on VC-WMS Gateway
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-zinc-400 border-t border-white/10 pt-3">
                <p>
                  <span className="text-white/70">Emergency Contact:</span> {card?.emergencyContactPhone || "N/A"}
                </p>
                <p className="text-[9px] text-zinc-500">Property of {card?.companyName}. If found, return to HR.</p>
              </div>
            </>
          )}

          {/* Badge Click Hint */}
          <div className="text-center pt-2">
            <span className="text-[10px] text-white/50 hover:text-white transition">
              🔄 Tap badge to flip ({flipped ? "Show Front" : "Show QR Code"})
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => setFlipped(!flipped)}>
          🔄 Flip Badge
        </Button>
        <a href="/api/v1/id-card/download" target="_blank" rel="noopener noreferrer">
          <Button variant="primary">⬇️ Download PDF Badge</Button>
        </a>
      </div>
    </div>
  );
}
