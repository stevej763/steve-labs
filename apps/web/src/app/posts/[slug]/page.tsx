"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Post = { slug: string; title: string; excerpt: string | null; body: string; publishedAt: string; featuredImageUrl: string | null };
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function PostPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/v1/posts/${params.slug}`)
      .then(async (response) => response.ok ? setPost(await response.json()) : setNotFound(true))
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (notFound) return <main className="site-shell"><nav className="site-nav"><Link className="wordmark" href="/">Steve&apos;s Lab</Link></nav><section className="masthead"><p className="eyebrow">Not found</p><h1>That note is not here.</h1></section></main>;
  if (!post) return <main className="site-shell"><nav className="site-nav"><Link className="wordmark" href="/">Steve&apos;s Lab</Link></nav><section className="masthead"><p className="eyebrow">Loading note</p></section></main>;

  return <main className="site-shell"><nav className="site-nav"><Link className="wordmark" href="/">Steve&apos;s Lab</Link><Link href="/">All writing</Link></nav><article className="post-page"><p className="eyebrow">Published {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p><h1>{post.title}</h1>{post.featuredImageUrl && <img className="post-hero-image" src={`${apiUrl}${post.featuredImageUrl}`} alt="" />}{post.excerpt && <p className="intro">{post.excerpt}</p>}<div className="post-body">{post.body.split("\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></main>;
}