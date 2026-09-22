import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sugarcube.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1, changeFrequency: "hourly" },
    { url: `${base}/magic-bags`, lastModified: now, priority: 0.9, changeFrequency: "hourly" },
    { url: `${base}/search`, lastModified: now, priority: 0.7 },
    { url: `${base}/impact`, lastModified: now, priority: 0.6 },
    { url: `${base}/favorites`, lastModified: now, priority: 0.5, changeFrequency: "weekly" },
    { url: `${base}/merchant`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${base}/about`, lastModified: now, priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/food-safety`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${base}/support`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
  ];
}
