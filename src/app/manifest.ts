import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JHV Agrosystem",
    short_name: "JHV Agro",
    description: "Sistema de gestão agropecuária JHV",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#21374f",
    lang: "pt-BR",
    icons: [
      {
        src: "/JHV_icon.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
