function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(value: string): string {
  let rendered = escapeHtml(value);

  rendered = rendered.replace(/`([^`]+)`/g, (_, code: string) => `<code>${escapeHtml(code)}</code>`);
  rendered = rendered.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_, alt: string, src: string) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`);
  rendered = rendered.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_, label: string, href: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`);
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/__(.+?)__/g, "<strong>$1</strong>");
  rendered = rendered.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  rendered = rendered.replace(/_([^_\n]+)_/g, "<em>$1</em>");

  return rendered;
}

export function markdownToHtml(markdown: string): string {
  const source = (markdown ?? "").replace(/\r\n/g, "\n").trim();
  if (!source) return "";

  const lines = source.split("\n");
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.replace(/^```\s?/, "").trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      const code = escapeHtml(codeLines.join("\n"));
      const className = language ? ` class="language-${escapeHtml(language)}"` : "";
      blocks.push(`<pre><code${className}>${code}</code></pre>`);

      if (index < lines.length && lines[index].startsWith("```")) {
        index += 1;
      }
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
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s+/.test(lines[index]) &&
      !/^[-*+]\s+/.test(lines[index]) &&
      !lines[index].startsWith("```") &&
      !lines[index].trim().startsWith(">")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push(`<p>${renderInline(paragraphLines.join(" "))}</p>`);
      continue;
    }

    index += 1;
  }

  return blocks.join("");
}
