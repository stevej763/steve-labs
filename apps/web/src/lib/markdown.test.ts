import test from "node:test";
import assert from "node:assert/strict";

import { markdownToHtml } from "./markdown";

test("renders markdown blocks and inline formatting", () => {
  const html = markdownToHtml(`# Title\n\n**bold** and *italic* and [link](https://example.com)\n\n- first\n- second\n\n\`\`\`js\nconst answer = 42;\n\`\`\``);

  assert.match(html, /<h1>Title<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /<a href="https:\/\/example.com">link<\/a>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<pre><code class="language-js">/);
  assert.match(html, /const answer = 42;/);
});

test("escapes raw HTML input", () => {
  const html = markdownToHtml("<script>alert('hi')</script>");
  assert.match(html, /&lt;script&gt;alert\(&#39;hi&#39;\)&lt;\/script&gt;/);
});
