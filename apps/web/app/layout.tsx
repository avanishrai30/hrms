import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AIavro Workforce",
  description: "AIavro multi-tenant workforce management platform",
  icons: {
    icon: "/brand/aiavro-favicon.png",
    apple: "/brand/aiavro-favicon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#101417",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
