"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const markdownToHtml = (value: string) => {
  const lines = (value ?? "").replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: string[] = [];

  function escapeHtml(input: string): string {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderInline(input: string): string {
    let rendered = escapeHtml(input);
    rendered = rendered.replace(/`([^`]+)`/g, (_, code: string) => `<code>${escapeHtml(code)}</code>`);
    rendered = rendered.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_, alt: string, src: string) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`);
    rendered = rendered.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_, label: string, href: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`);
    rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    rendered = rendered.replace(/__(.+?)__/g, "<strong>$1</strong>");
    rendered = rendered.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    rendered = rendered.replace(/_([^_\n]+)_/g, "<em>$1</em>");
    return rendered;
  }

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    if (line.startsWith("```")) {
      const language = line.replace(/^```\s?/, "").trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) { codeLines.push(lines[index]); index += 1; }
      const codeHtml = escapeHtml(codeLines.join("\n"));
      const className = language ? ` class="language-${escapeHtml(language)}"` : "";
      blocks.push(`<pre><code${className}>${codeHtml}</code></pre>`);
      if (index < lines.length && lines[index].startsWith("```")) index += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        blocks.push(`<h${level}>${renderInline(match[2])}</h${level}>`);
        index += 1;
        continue;
      }
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index])) {
        items.push(`<li>${renderInline(lines[index].replace(/^[-*+]\s+/, ""))}</li>`);
        index += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^#{1,6}\s+/.test(lines[index]) && !/^[-*+]\s+/.test(lines[index]) && !lines[index].startsWith("```")) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push(`<p>${renderInline(paragraphLines.join(" "))}</p>`);
      continue;
    }

    index += 1;
  }

  return blocks.join("") || "<p></p>";
};

type Post = { id: string; slug: string; title: string; excerpt: string | null; body: string; status: "DRAFT" | "PUBLISHED"; publishedAt: string | null; featuredMediaId: string | null; featuredImageUrl: string | null };
type Draft = Omit<Post, "status" | "publishedAt">;
type Media = { id: string; filename: string; contentType: string; sizeBytes: number; url: string; uploadedAt: string };
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const emptyDraft: Draft = { id: "new", slug: "", title: "", excerpt: "", body: "", featuredMediaId: null, featuredImageUrl: null };

export default function Home() {
  const [session, setSession] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [baseline, setBaseline] = useState<Draft | null>(null);
  const [view, setView] = useState<"edit" | "preview" | "media">("edit");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(baseline);

  function insertMarkdown(prefix: string, suffix = prefix, placeholder = "text") {
    if (!draft) return;

    const textarea = textareaRef.current;
    const currentValue = draft.body;
    const start = textarea ? textarea.selectionStart : currentValue.length;
    const end = textarea ? textarea.selectionEnd : currentValue.length;
    const selected = currentValue.slice(start, end) || placeholder;
    const nextValue = `${currentValue.slice(0, start)}${prefix}${selected}${suffix}${currentValue.slice(end)}`;

    setDraft({ ...draft, body: nextValue });

    if (textarea) {
      requestAnimationFrame(() => {
        textarea.focus();
        const nextStart = start + prefix.length;
        const nextEnd = nextStart + selected.length;
        textarea.selectionStart = nextStart;
        textarea.selectionEnd = nextEnd;
      });
    }
  }

  function insertBlockMarkdown(block: string) {
    if (!draft) return;
    const textarea = textareaRef.current;
    const currentValue = draft.body;
    const start = textarea ? textarea.selectionStart : currentValue.length;
    const end = textarea ? textarea.selectionEnd : currentValue.length;
    const before = currentValue.slice(0, start);
    const after = currentValue.slice(end);
    const nextValue = `${before}${block}${after}`;

    setDraft({ ...draft, body: nextValue });

    if (textarea) {
      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = start + block.length;
        textarea.selectionStart = cursor;
        textarea.selectionEnd = cursor;
      });
    }
  }

  function insertImageMarkdown(imageUrl: string, filename: string) {
    if (!draft) return;
    const markdown = `![${filename}](${imageUrl})\n`;
    insertBlockMarkdown(markdown);
    setView("edit");
  }

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

  async function loadMedia() {
    const response = await fetch(`${apiUrl}/api/v1/admin/media`, { credentials: "include" });
    if (!response.ok) throw new Error("Could not load media.");
    setMedia(await response.json());
  }

  useEffect(() => {
    fetch(`${apiUrl}/api/v1/admin/session`, { credentials: "include" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (data) { setSession(data.username); return Promise.all([loadPosts(), loadMedia()]); } })
      .catch(() => setError("Could not reach the editorial API."));
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const response = await fetch(`${apiUrl}/login`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(event.currentTarget) as unknown as URLSearchParams) });
    if (!response.ok) { setError("Those credentials were not accepted."); return; }
    const data = await (await fetch(`${apiUrl}/api/v1/admin/session`, { credentials: "include" })).json();
    setSession(data.username); await Promise.all([loadPosts(), loadMedia()]);
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
    setDraft(savedDraft); setBaseline(savedDraft); await Promise.all([loadPosts(), loadMedia()]);
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
    const mediaItem = await response.json();
    setDraft({ ...draft, featuredMediaId: mediaItem.id, featuredImageUrl: mediaItem.url });
    await loadMedia();
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
        <div><span>Media</span><strong>{media.length}</strong></div>
      </section>
      <section className="content-panel" aria-labelledby="posts-heading">
        <div className="panel-heading"><div><p className="admin-kicker">Content</p><h2 id="posts-heading">Posts</h2></div><button className="filter-button" type="button" onClick={closeDraft}>All posts</button></div>
        {draft ? <><div className="editor-tabs"><button type="button" className={view === "edit" ? "active" : "filter-button"} onClick={() => setView("edit")}>Edit</button><button type="button" className={view === "preview" ? "active" : "filter-button"} onClick={() => setView("preview")}>Preview</button><button type="button" className={view === "media" ? "active" : "filter-button"} onClick={() => setView("media")}>Media library</button>{isDirty && <span>Unsaved changes</span>}</div>{view === "edit" ? <form className="post-editor" onSubmit={savePost}><label>Title<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></label><label>Excerpt<textarea value={draft.excerpt ?? ""} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} /></label><div className="markdown-toolbar"><button type="button" className="filter-button" onClick={() => insertMarkdown("**", "**", "bold")}><strong>B</strong></button><button type="button" className="filter-button" onClick={() => insertMarkdown("*", "*", "italic")}><em>I</em></button><button type="button" className="filter-button" onClick={() => insertMarkdown("[", "](https://example.com)", "link")}>Link</button><button type="button" className="filter-button" onClick={() => insertBlockMarkdown("\n## Heading\n")}>H2</button><button type="button" className="filter-button" onClick={() => insertBlockMarkdown("\n- List item\n")}>List</button><button type="button" className="filter-button" onClick={() => insertBlockMarkdown("\n> Quote\n")}>Quote</button><button type="button" className="filter-button" onClick={() => insertBlockMarkdown("\n```js\nconst answer = 42;\n```\n")}>Code block</button></div><label>Body<textarea ref={textareaRef} required value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} /></label><section className="image-upload"><p className="admin-kicker">Featured image</p>{draft.featuredImageUrl ? <><img src={mediaUrl(draft.featuredImageUrl) ?? ""} alt="Featured image preview" /><button className="filter-button" type="button" onClick={() => setDraft({ ...draft, featuredMediaId: null, featuredImageUrl: null })}>Remove image</button></> : <label className="upload-control">Choose image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) uploadFeaturedImage(file); }} /></label>}</section><div><button type="button" className="filter-button" onClick={closeDraft}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving..." : "Save draft"}</button></div>{error && <p className="form-error">{error}</p>}</form> : view === "preview" ? <article className="draft-preview"><p className="admin-kicker">Preview</p><h2>{draft.title || "Untitled post"}</h2>{draft.featuredImageUrl && <img src={mediaUrl(draft.featuredImageUrl) ?? ""} alt="" />}{draft.excerpt && <p className="preview-excerpt">{draft.excerpt}</p>}<div className="markdown-preview" dangerouslySetInnerHTML={{ __html: markdownToHtml(draft.body || "_No body yet._") }} /></article> : <div className="media-library"><p className="admin-kicker">Click to insert into body</p>{media.length ? <div className="media-grid">{media.map((item) => <div key={item.id} className="media-item" onClick={() => insertImageMarkdown(mediaUrl(item.url) ?? "", item.filename)}><img src={mediaUrl(item.url) ?? ""} alt={item.filename} /><p>{item.filename}</p><span>{(item.sizeBytes / 1024).toFixed(0)} KB</span></div>)}</div> : <p>No media uploaded yet.</p>}</div>}</> : posts.length ? <div className="post-list">{posts.map((post) => <article key={post.id}><div><p className="admin-kicker">{post.status}</p><h3>{post.title}</h3><span>/{post.slug}</span></div><div className="post-actions"><button className="filter-button" onClick={() => openDraft(toDraft(post))}>Edit</button><button className="filter-button" onClick={() => transition(post, post.status === "DRAFT" ? "publish" : "unpublish")}>{post.status === "DRAFT" ? "Publish" : "Unpublish"}</button></div></article>)}</div> : <div className="empty-state"><p>No posts yet.</p><span>Begin with a draft when there is something worth keeping.</span></div>}
      </section>
      {pendingAction && <div className="confirm-backdrop" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="discard-title"><p className="admin-kicker">Unsaved changes</p><h2 id="discard-title">Leave this draft?</h2><p>Your edits have not been saved.</p><div><button className="filter-button" type="button" onClick={() => setPendingAction(null)}>Keep editing</button><button type="button" onClick={() => { const action = pendingAction; setPendingAction(null); setDraft(null); setBaseline(null); action(); }}>Discard changes</button></div></section></div>}
    </main>
  );
}
