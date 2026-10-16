/**
 * Minimal, safe Markdown → React for AI replies (no dangerouslySetInnerHTML).
 * Supports paragraphs, line breaks, headings, bullet/numbered lists,
 * **bold**, *italic*, `code` and [links](https://…).
 */
const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|_[^_\s][^_]*_|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

function inline(text, keyBase) {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (!part) return null;
    if (/^(\*\*|__)/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (/^`/.test(part)) return <code key={key} className="rounded bg-surface-2 px-1 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    if (/^\[/.test(part)) {
      const [, label, href] = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/) || [];
      if (href)
        return (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-primary underline">
            {label}
          </a>
        );
    }
    if (/^[*_]/.test(part) && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    return part;
  });
}

export default function Markdown({ text }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out = [];
  let list = null;
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    const k = `p${out.length}`;
    out.push(
      <p key={k}>
        {para.map((l, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {inline(l, `${k}-${i}`)}
          </span>
        ))}
      </p>
    );
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const k = `l${out.length}`;
    const Tag = list.ordered ? "ol" : "ul";
    out.push(
      <Tag key={k} className={`${list.ordered ? "list-decimal" : "list-disc"} space-y-1 pl-5 marker:text-primary`}>
        {list.items.map((it, i) => (
          <li key={i}>{inline(it, `${k}-${i}`)}</li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const num = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (bullet || num) {
      flushPara();
      const ordered = Boolean(num);
      if (list && list.ordered !== ordered) flushList();
      list ||= { ordered, items: [] };
      list.items.push((bullet || num)[1]);
    } else if (heading) {
      flushPara();
      flushList();
      out.push(
        <p key={`h${out.length}`} className="font-bold text-ink">
          {inline(heading[1], `h${out.length}`)}
        </p>
      );
    } else if (!line.trim()) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return <div className="space-y-2.5">{out}</div>;
}
