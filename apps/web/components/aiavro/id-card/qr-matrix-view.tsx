"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

export interface QrPayloadViewProps {
  payload?: string | null | undefined;
  size?: number | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
}

export function QrPayloadView({
  payload,
  size = 110,
  className = "",
  ariaLabel = "Digital employee identification QR code"
}: QrPayloadViewProps) {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    if (!payload || !payload.trim()) {
      setSvgMarkup(null);
      return;
    }

    let isMounted = true;
    QRCode.toString(payload, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 4,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF"
      }
    })
      .then((svg) => {
        if (isMounted) {
          setSvgMarkup(svg);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSvgMarkup(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [payload]);

  if (!payload || !payload.trim() || !svgMarkup) {
    return (
      <div className={`flex items-center justify-center p-3 text-center text-[10px] text-purple-300/70 font-mono ${className}`}>
        Digital verification not available
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center p-1 bg-white rounded-control shadow-sm overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

// Retain QrMatrixView alias for backward compatibility
export const QrMatrixView = QrPayloadView;
