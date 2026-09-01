"use client";

import { cn } from "@vc-wms/ui";

interface MapPreviewProps {
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  userLatitude?: number | undefined;
  userLongitude?: number | undefined;
  userAccuracy?: number | undefined;
  distanceMeters?: number | null | undefined;
  isVerified?: boolean | undefined;
  className?: string;
}

export function MapPreview({
  locationName,
  latitude,
  longitude,
  radiusMeters,
  userLatitude,
  userLongitude,
  userAccuracy,
  distanceMeters,
  isVerified,
  className
}: MapPreviewProps) {
  // SVG coordinates: viewBox 0 0 300 200, center at (150, 100)
  const centerX = 150;
  const centerY = 100;
  const pixelRadius = 50; // 50px represents the radiusMeters

  // Calculate user offset in pixels if user coordinates exist
  let userX = centerX;
  let userY = centerY;
  const hasUserPos = userLatitude !== undefined && userLongitude !== undefined;

  if (hasUserPos && distanceMeters !== undefined && distanceMeters !== null) {
    const scale = pixelRadius / Math.max(radiusMeters, 1);
    // Rough planar projection offset for visualization
    const latDiff = (userLatitude - latitude) * 111000;
    const lonDiff = (userLongitude - longitude) * 111000 * Math.cos((latitude * Math.PI) / 180);
    userX = Math.min(270, Math.max(30, centerX + lonDiff * scale));
    userY = Math.min(180, Math.max(20, centerY - latDiff * scale));
  }

  const isInside = isVerified ?? (distanceMeters !== undefined && distanceMeters !== null && distanceMeters <= radiusMeters);

  return (
    <div className={cn("relative overflow-hidden rounded-panel border border-border bg-slate-900 text-slate-100", className)}>
      {/* Informational overlay header */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-0.5 rounded-control bg-slate-950/80 px-2.5 py-1.5 backdrop-blur">
        <span className="text-xs font-semibold text-white">{locationName}</span>
        <span className="text-[10px] text-slate-400">
          {latitude.toFixed(5)}, {longitude.toFixed(5)} • Radius {radiusMeters}m
        </span>
      </div>

      {/* Verification status badge */}
      {hasUserPos && (
        <div className="absolute right-3 top-3 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur",
              isInside ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", isInside ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
            {isInside ? "Inside Perimeter" : "Outside Perimeter"}
          </span>
        </div>
      )}

      {/* SVG Canvas Map Surface */}
      <svg className="h-56 w-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
        {/* Subtle grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="geofenceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isInside ? "#10b981" : "#f43f5e"} stopOpacity="0.35" />
            <stop offset="100%" stopColor={isInside ? "#10b981" : "#f43f5e"} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        <rect width="300" height="200" fill="url(#grid)" />

        {/* Outer reference concentric rings */}
        <circle cx={centerX} cy={centerY} r={pixelRadius * 1.5} fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />

        {/* Geofence circular perimeter */}
        <circle
          cx={centerX}
          cy={centerY}
          r={pixelRadius}
          fill="url(#geofenceGrad)"
          stroke={isInside ? "#10b981" : "#f43f5e"}
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />

        {/* Connecting line between center and employee */}
        {hasUserPos && (userX !== centerX || userY !== centerY) && (
          <line
            x1={centerX}
            y1={centerY}
            x2={userX}
            y2={userY}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}

        {/* Center pin (Workplace) */}
        <circle cx={centerX} cy={centerY} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
        <text x={centerX} y={centerY + 16} textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="600">
          Center
        </text>

        {/* Employee GPS Marker */}
        {hasUserPos && (
          <g>
            {/* Accuracy ring */}
            {userAccuracy && (
              <circle
                cx={userX}
                cy={userY}
                r={Math.min(25, Math.max(8, (userAccuracy / radiusMeters) * pixelRadius))}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="1"
              />
            )}
            {/* User dot */}
            <circle cx={userX} cy={userY} r="6" fill={isInside ? "#10b981" : "#f43f5e"} stroke="#ffffff" strokeWidth="2" />
            <text x={userX} y={userY - 9} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="600">
              You
            </text>
          </g>
        )}
      </svg>

      {/* Footer distance readout */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-400">
        <span>Perimeter: {radiusMeters}m</span>
        {distanceMeters !== undefined && distanceMeters !== null ? (
          <span className="font-medium text-slate-200">
            Distance: {Math.round(distanceMeters)}m {userAccuracy ? `(±${Math.round(userAccuracy)}m accuracy)` : ""}
          </span>
        ) : (
          <span>Server-validated GPS boundary</span>
        )}
      </div>
    </div>
  );
}
