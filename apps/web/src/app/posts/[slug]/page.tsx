import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { getPost, mediaUrl } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt ?? post.body.slice(0, 160),
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? post.body.slice(0, 160),
      publishedTime: post.publishedAt,
      images: post.featuredImageUrl ? [{ url: mediaUrl(post.featuredImageUrl) ?? "" }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return <main className="site-shell"><nav className="site-nav"><Link className="wordmark" href="/">Steve&apos;s Lab</Link><Link href="/">All writing</Link></nav><article className="post-page"><p className="eyebrow">Published {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p><h1>{post.title}</h1>{post.tags.length > 0 && <ul className="post-tags" aria-label="Tags">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}{post.featuredImageUrl && <img className="post-hero-image" src={mediaUrl(post.featuredImageUrl) ?? ""} alt="" />}{post.excerpt && <p className="intro">{post.excerpt}</p>}<div className="post-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(post.body) }} /></article></main>;
}