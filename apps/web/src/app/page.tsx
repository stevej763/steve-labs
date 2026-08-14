export default function Home() {
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
        <p className="eyebrow">Independent notes from the workbench</p>
        <h1>Ideas are better when you leave the wires showing.</h1>
        <p className="intro">A field journal for software, systems, and the odd practical experiment.</p>
      </section>

      <section className="featured" id="writing" aria-labelledby="featured-heading">
        <p className="section-label">Latest experiment</p>
        <article>
          <p className="post-meta">Systems · 8 min read</p>
          <h2 id="featured-heading">Building small tools that stay useful</h2>
          <p>Start with the awkward, repeatable work. Give it a calm home. Then keep the edges visible enough to improve.</p>
          <a className="read-link" href="#notes">Read the note <span aria-hidden="true">→</span></a>
        </article>
      </section>

      <section className="note-grid" id="notes" aria-label="Recent notes">
        <article><p className="post-meta">Notebook</p><h2>What I look for in a good default</h2></article>
        <article><p className="post-meta">Web</p><h2>A little color, used with intent</h2></article>
        <article><p className="post-meta">Fieldwork</p><h2>Keeping a record of what changed</h2></article>
      </section>

      <footer id="about"><span>Steve&apos;s Lab</span><span>steve-lab.uk</span></footer>
    </main>
  );
}
