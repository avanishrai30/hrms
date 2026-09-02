"use client";

import React, { useMemo } from "react";
import { generateQrMatrix } from "../../../lib/qr-matrix";

interface QrMatrixViewProps {
  payload?: string | null | undefined;
  size?: number | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
}

export function QrMatrixView({
  payload,
  size = 110,
  className = "",
  ariaLabel = "Scannable digital identity QR code"
}: QrMatrixViewProps) {
  const matrix = useMemo(() => {
    if (!payload || !payload.trim()) return [];
    return generateQrMatrix(payload);
  }, [payload]);

  if (!matrix || matrix.length === 0) {
    return (
      <div className={`flex items-center justify-center p-3 text-center text-[10px] text-purple-300/70 font-mono ${className}`}>
        Digital verification not available
      </div>
    );
  }

  const moduleCount = matrix.length;
  // Standard quiet zone of 2 modules on each side
  const quietZone = 2;
  const totalGridSize = moduleCount + quietZone * 2;

  return (
    <div
      className={`inline-flex items-center justify-center p-2 bg-white rounded-control shadow-sm ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${totalGridSize} ${totalGridSize}`}
        width={size}
        height={size}
        className="w-full h-full text-zinc-950 shape-rendering-crisp"
        fill="currentColor"
      >
        <rect width={totalGridSize} height={totalGridSize} fill="#FFFFFF" />
        {matrix.map((row, r) =>
          row.map((isDark, c) =>
            isDark ? (
              <rect
                key={`${r}-${c}`}
                x={c + quietZone}
                y={r + quietZone}
                width="1"
                height="1"
                fill="#0F172A"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
