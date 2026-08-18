import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SugarCube — Rescue a sweet tonight",
    short_name: "SugarCube",
    description: "Bakery leftover marketplace. Rescue fresh treats at 40–70% off before they go to waste.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8F0",
    theme_color: "#FFD9C4",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
