import type { MetadataRoute } from "next";
import { getPrograms } from "@/lib/programs";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ldce-student-resources.vercel.app";
  const programs = await getPrograms();
  return [{ url: base, changeFrequency: "weekly", priority: 1 }, { url: `${base}/programs`, changeFrequency: "monthly", priority: 0.8 }, { url: `${base}/search`, changeFrequency: "weekly", priority: 0.8 }, { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 }, ...programs.map((program) => ({ url: `${base}/programs/${program.slug}`, changeFrequency: "monthly" as const, priority: 0.7 }))];
}
