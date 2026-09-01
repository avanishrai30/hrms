import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VC-WMS",
    short_name: "VC-WMS",
    description: "Multi-tenant workforce management SaaS platform",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f8f5",
    theme_color: "#1f8f5f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}

