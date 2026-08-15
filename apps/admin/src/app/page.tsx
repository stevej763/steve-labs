"use client";

import { FormEvent, useEffect, useState } from "react";

type Post = { id: string; slug: string; title: string; excerpt: string | null; body: string; status: "DRAFT" | "PUBLISHED"; publishedAt: string | null; featuredMediaId: string | null; featuredImageUrl: string | null };
type Draft = Omit<Post, "status" | "publishedAt">;
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const emptyDraft: Draft = { id: "new", slug: "", title: "", excerpt: "", body: "", featuredMediaId: null, featuredImageUrl: null };

export default function Home() {
  const [session, setSession] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [baseline, setBaseline] = useState<Draft | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [saving, setSaving] = useState(false);
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(baseline);

  function toDraft(post: Post): Draft {
    return { id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt, body: post.body, featuredMediaId: post.featuredMediaId, featuredImageUrl: post.featuredImageUrl };
  }

  function openDraft(nextDraft: Draft) {
    if (isDirty) { setPendingAction(() => () => openDraft(nextDraft)); return; }
    setDraft(nextDraft); setBaseline(nextDraft); setView("edit"); setError("");
  }

  function closeDraft() {
    if (isDirty) { setPendingAction(() => closeDraft); return; }
    setDraft(null); setBaseline(null); setView("edit"); setError("");
  }

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => { if (isDirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

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
    event.preventDefault(); if (!draft) return;
    setSaving(true); setError("");
    const isNew = draft.id === "new";
    const { id, ...data } = draft;
    const response = await fetch(`${apiUrl}/api/v1/admin/posts${isNew ? "" : `/${id}`}`, { method: isNew ? "POST" : "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (!response.ok) { setError("Could not save post. Check the slug and required fields."); return; }
    const saved = await response.json() as Post;
    const savedDraft = toDraft(saved);
    setDraft(savedDraft); setBaseline(savedDraft); await loadPosts();
  }

  async function transition(post: Post, action: "publish" | "unpublish") {
    await fetch(`${apiUrl}/api/v1/admin/posts/${post.id}/${action}`, { method: "POST", credentials: "include" });
    await loadPosts();
  }

  function mediaUrl(url: string | null) {
    return url ? `${apiUrl}${url}` : null;
  }

  async function uploadFeaturedImage(file: File) {
    if (!draft) return;
    setError("");
    const data = new FormData(); data.append("file", file);
    const response = await fetch(`${apiUrl}/api/v1/admin/media`, { method: "POST", credentials: "include", body: data });
    if (!response.ok) { setError(response.status === 507 ? "Object storage is full. Free disk space before uploading an image." : "Could not upload image. Use a JPEG, PNG, WebP, or GIF under 10 MB."); return; }
    const media = await response.json();
    setDraft({ ...draft, featuredMediaId: media.id, featuredImageUrl: media.url });
  }

  if (!session) return <main className="admin-shell login-shell"><section className="login-panel"><p className="admin-kicker">Steve&apos;s Lab</p><h1>Editorial desk</h1><p>Sign in to work on a post.</p><form onSubmit={login}><label>Username<input required name="username" autoComplete="username" /></label><label>Password<input required name="password" type="password" autoComplete="current-password" /></label><button type="submit">Sign in</button>{error && <p className="form-error">{error}</p>}</form></section></main>;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><p className="admin-kicker">Steve&apos;s Lab</p><h1>Editorial desk</h1></div>
        <button type="button" onClick={() => openDraft(emptyDraft)}>New post</button>
      </header>
      <section className="admin-summary" aria-label="Publishing summary">
        <div><span>Published</span><strong>{posts.filter((post) => post.status === "PUBLISHED").length}</strong></div>
        <div><span>Drafts</span><strong>{posts.filter((post) => post.status === "DRAFT").length}</strong></div>
        <div><span>Media</span><strong>0</strong></div>
      </section>
      <section className="content-panel" aria-labelledby="posts-heading">
        <div className="panel-heading"><div><p className="admin-kicker">Content</p><h2 id="posts-heading">Posts</h2></div><button className="filter-button" type="button">All posts</button></div>
        {draft ? <><div className="editor-tabs"><button type="button" className={view === "edit" ? "active" : "filter-button"} onClick={() => setView("edit")}>Edit</button><button type="button" className={view === "preview" ? "active" : "filter-button"} onClick={() => setView("preview")}>Preview</button>{isDirty && <span>Unsaved changes</span>}</div>{view === "edit" ? <form className="post-editor" onSubmit={savePost}><label>Title<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></label><label>Excerpt<textarea value={draft.excerpt ?? ""} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} /></label><label>Body<textarea required value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} /></label><section className="image-upload"><p className="admin-kicker">Featured image</p>{draft.featuredImageUrl ? <><img src={mediaUrl(draft.featuredImageUrl) ?? ""} alt="Featured image preview" /><button className="filter-button" type="button" onClick={() => setDraft({ ...draft, featuredMediaId: null, featuredImageUrl: null })}>Remove image</button></> : <label className="upload-control">Choose image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) uploadFeaturedImage(file); }} /></label>}</section><div><button type="button" className="filter-button" onClick={closeDraft}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving..." : "Save draft"}</button></div>{error && <p className="form-error">{error}</p>}</form> : <article className="draft-preview"><p className="admin-kicker">Preview</p><h2>{draft.title || "Untitled post"}</h2>{draft.featuredImageUrl && <img src={mediaUrl(draft.featuredImageUrl) ?? ""} alt="" />}{draft.excerpt && <p className="preview-excerpt">{draft.excerpt}</p>}<div>{draft.body.split("\n").map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph || " "}</p>)}</div></article>}</> : posts.length ? <div className="post-list">{posts.map((post) => <article key={post.id}><div><p className="admin-kicker">{post.status}</p><h3>{post.title}</h3><span>/{post.slug}</span></div><div className="post-actions"><button className="filter-button" onClick={() => openDraft(toDraft(post))}>Edit</button><button className="filter-button" onClick={() => transition(post, post.status === "DRAFT" ? "publish" : "unpublish")}>{post.status === "DRAFT" ? "Publish" : "Unpublish"}</button></div></article>)}</div> : <div className="empty-state"><p>No posts yet.</p><span>Begin with a draft when there is something worth keeping.</span></div>}
      </section>
      {pendingAction && <div className="confirm-backdrop" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="discard-title"><p className="admin-kicker">Unsaved changes</p><h2 id="discard-title">Leave this draft?</h2><p>Your edits have not been saved.</p><div><button className="filter-button" type="button" onClick={() => setPendingAction(null)}>Keep editing</button><button type="button" onClick={() => { const action = pendingAction; setPendingAction(null); setDraft(null); setBaseline(null); action(); }}>Discard changes</button></div></section></div>}
    </main>
  );
}
