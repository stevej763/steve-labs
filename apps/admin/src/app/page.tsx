export default function Home() {
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><p className="admin-kicker">Steve&apos;s Lab</p><h1>Editorial desk</h1></div>
        <button type="button">New post</button>
      </header>
      <section className="admin-summary" aria-label="Publishing summary">
        <div><span>Published</span><strong>0</strong></div>
        <div><span>Drafts</span><strong>0</strong></div>
        <div><span>Media</span><strong>0</strong></div>
      </section>
      <section className="content-panel" aria-labelledby="posts-heading">
        <div className="panel-heading"><div><p className="admin-kicker">Content</p><h2 id="posts-heading">Posts</h2></div><button className="filter-button" type="button">All posts</button></div>
        <div className="empty-state"><p>No posts yet.</p><span>Begin with a draft when there is something worth keeping.</span></div>
      </section>
    </main>
  );
}
