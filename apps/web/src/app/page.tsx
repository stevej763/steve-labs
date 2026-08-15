import Link from "next/link";
import { getPosts, mediaUrl } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts();
  const featured = posts[0];
  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <a className="wordmark" href="#top">Steve&apos;s Lab</a>
        <div className="nav-links">
          <a href="#writing">Writing</a>
          <a href="#notes">Notes</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <section className="masthead" id="top">
        <p className="eyebrow">Notes on software and technology</p>
        <h1>Steve&apos;s Lab</h1>
        <p className="intro">Writing about software, projects, and other things I find interesting.</p>
      </section>

      {featured && <section className="featured" id="writing" aria-labelledby="featured-heading">
        <p className="section-label">Latest post</p>
        <article>
          <p className="post-meta">Published {new Date(featured.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          {featured.featuredImageUrl && <img className="featured-image" src={mediaUrl(featured.featuredImageUrl) ?? ""} alt="" />}
          <h2 id="featured-heading">{featured.title}</h2>
          <p>{featured.excerpt ?? featured.body}</p>
          <Link className="read-link" href={`/posts/${featured.slug}`}>Read more <span aria-hidden="true">→</span></Link>
        </article>
      </section>}

      <section id="notes" aria-label="More posts">
        {posts.length > 1 && <p className="section-label more-posts-label">More posts</p>}
        <div className="note-grid">
          {posts.slice(featured ? 1 : 0).map((post) => <article key={post.slug}>{post.featuredImageUrl && <img className="post-thumbnail" src={mediaUrl(post.featuredImageUrl) ?? ""} alt="" />}<p className="post-meta">Published</p><h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt ?? post.body}</p></article>)}
          {!posts.length && <article><p className="post-meta">Notebook</p><h2>The first note is still on the workbench.</h2></article>}
        </div>
      </section>

      <footer id="about"><span>Steve&apos;s Lab</span><span>steve-lab.uk</span></footer>
    </main>
  );
}
