import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AIavro Workforce",
    short_name: "AIavro",
    description: "AIavro multi-tenant workforce management platform",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f7f4",
    theme_color: "#101417",
    icons: [
      {
        src: "/brand/aiavro-favicon.png",
        sizes: "1024x1024",
        type: "image/png"
      }
    ]
  };
}
