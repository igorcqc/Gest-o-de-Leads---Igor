import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRM Protocolo 10K",
    short_name: "Protocolo 10K",
    description: "Prospecção, leads e rotina comercial",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#1f2937",
    icons: [{ src: "/favicon.ico", sizes: "256x256", type: "image/x-icon" }],
  };
}
