import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    { url: siteUrl, lastModified: new Date() },
    ...posts.map((post) => ({ url: `${siteUrl}/posts/${post.slug}`, lastModified: new Date(post.publishedAt) })),
  ];
}