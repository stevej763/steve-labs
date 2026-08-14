"use client";

import { FormEvent, useEffect, useState } from "react";

type Post = { id: string; slug: string; title: string; excerpt: string | null; body: string; status: "DRAFT" | "PUBLISHED"; publishedAt: string | null; featuredMediaId: string | null; featuredImageUrl: string | null };
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function Home() {
  const [session, setSession] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Post | null>(null);

  async function loadPosts() {
    const response = await fetch(`${apiUrl}/api/v1/admin/posts`, { credentials: "include" });
    if (!response.ok) throw new Error("Could not load posts.");
    setPosts(await response.json());
  }

  useEffect(() => {
    fetch(`${apiUrl}/api/v1/admin/session`, { credentials: "include" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (data) { setSession(data.username); return loadPosts(); } })
      .catch(() => setError("Could not reach the editorial API."));
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const response = await fetch(`${apiUrl}/login`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(event.currentTarget) as unknown as URLSearchParams) });
    if (!response.ok) { setError("Those credentials were not accepted."); return; }
    const data = await (await fetch(`${apiUrl}/api/v1/admin/session`, { credentials: "include" })).json();
    setSession(data.username); await loadPosts();
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const isNew = editing.id === "new";
    const response = await fetch(`${apiUrl}/api/v1/admin/posts${isNew ? "" : `/${editing.id}`}`, { method: isNew ? "POST" : "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!response.ok) { setError("Could not save post. Check the slug and required fields."); return; }
    setEditing(null); await loadPosts();
  }

  async function transition(post: Post, action: "publish" | "unpublish") {
    await fetch(`${apiUrl}/api/v1/admin/posts/${post.id}/${action}`, { method: "POST", credentials: "include" });
    await loadPosts();
  }

  function mediaUrl(url: string | null) {
    return url ? `${apiUrl}${url}` : null;
  }

  async function uploadFeaturedImage(file: File) {
    if (!editing) return;
    setError("");
    const data = new FormData(); data.append("file", file);
    const response = await fetch(`${apiUrl}/api/v1/admin/media`, { method: "POST", credentials: "include", body: data });
    if (!response.ok) { setError(response.status === 507 ? "Object storage is full. Free disk space before uploading an image." : "Could not upload image. Use a JPEG, PNG, WebP, or GIF under 10 MB."); return; }
    const media = await response.json();
    setEditing({ ...editing, featuredMediaId: media.id, featuredImageUrl: media.url });
  }

  if (!session) return <main className="admin-shell login-shell"><section className="login-panel"><p className="admin-kicker">Steve&apos;s Lab</p><h1>Editorial desk</h1><p>Sign in to work on a post.</p><form onSubmit={login}><label>Username<input required name="username" autoComplete="username" /></label><label>Password<input required name="password" type="password" autoComplete="current-password" /></label><button type="submit">Sign in</button>{error && <p className="form-error">{error}</p>}</form></section></main>;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><p className="admin-kicker">Steve&apos;s Lab</p><h1>Editorial desk</h1></div>
        <button type="button" onClick={() => setEditing({ id: "new", slug: "", title: "", excerpt: "", body: "", status: "DRAFT", publishedAt: null, featuredMediaId: null, featuredImageUrl: null })}>New post</button>
      </header>
      <section className="admin-summary" aria-label="Publishing summary">
        <div><span>Published</span><strong>{posts.filter((post) => post.status === "PUBLISHED").length}</strong></div>
        <div><span>Drafts</span><strong>{posts.filter((post) => post.status === "DRAFT").length}</strong></div>
        <div><span>Media</span><strong>0</strong></div>
      </section>
      <section className="content-panel" aria-labelledby="posts-heading">
        <div className="panel-heading"><div><p className="admin-kicker">Content</p><h2 id="posts-heading">Posts</h2></div><button className="filter-button" type="button">All posts</button></div>
        {editing ? <form className="post-editor" onSubmit={savePost}><label>Title<input required name="title" defaultValue={editing.title} /></label><label>Slug<input required name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={editing.slug} /></label><label>Excerpt<textarea name="excerpt" defaultValue={editing.excerpt ?? ""} /></label><label>Body<textarea required name="body" defaultValue={editing.body} /></label><input name="featuredMediaId" type="hidden" value={editing.featuredMediaId ?? ""} readOnly /><section className="image-upload"><p className="admin-kicker">Featured image</p>{editing.featuredImageUrl ? <><img src={mediaUrl(editing.featuredImageUrl) ?? ""} alt="Featured image preview" /><button className="filter-button" type="button" onClick={() => setEditing({ ...editing, featuredMediaId: null, featuredImageUrl: null })}>Remove image</button></> : <label className="upload-control">Choose image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) uploadFeaturedImage(file); }} /></label>}</section><div><button type="button" className="filter-button" onClick={() => setEditing(null)}>Cancel</button><button type="submit">Save draft</button></div>{error && <p className="form-error">{error}</p>}</form> : posts.length ? <div className="post-list">{posts.map((post) => <article key={post.id}><div><p className="admin-kicker">{post.status}</p><h3>{post.title}</h3><span>/{post.slug}</span></div><div className="post-actions"><button className="filter-button" onClick={() => setEditing(post)}>Edit</button><button className="filter-button" onClick={() => transition(post, post.status === "DRAFT" ? "publish" : "unpublish")}>{post.status === "DRAFT" ? "Publish" : "Unpublish"}</button></div></article>)}</div> : <div className="empty-state"><p>No posts yet.</p><span>Begin with a draft when there is something worth keeping.</span></div>}
      </section>
    </main>
  );
}
