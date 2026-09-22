import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
    sitemap: "https://sugarcube.app/sitemap.xml",
    host: "https://sugarcube.app",
  };
}
