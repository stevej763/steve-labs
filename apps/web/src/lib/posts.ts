export type PublicPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  publishedAt: string;
  featuredImageUrl: string | null;
  tags: string[];
};

const publicApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const internalApiUrl = process.env.INTERNAL_API_URL ?? publicApiUrl;

export function mediaUrl(url: string | null) {
  return url ? `${publicApiUrl}${url}` : null;
}

export async function getPosts() {
  try {
    const response = await fetch(`${internalApiUrl}/api/v1/posts`, { next: { revalidate: 60 } });
    if (!response.ok) return [] as PublicPost[];
    return response.json() as Promise<PublicPost[]>;
  } catch {
    return [] as PublicPost[];
  }
}

export async function getPost(slug: string) {
  try {
    const response = await fetch(`${internalApiUrl}/api/v1/posts/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    return response.json() as Promise<PublicPost>;
  } catch {
    return null;
  }
}