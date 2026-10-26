import { stripHtml } from "./text";
import type { Block, Manual } from "./types";

// 全角・半角や大文字・小文字の違いを吸収して比べる
const normalize = (s: string) => s.normalize("NFKC").toLowerCase();

function blockText(b: Block): string {
  switch (b.type) {
    case "text":
    case "alert":
    case "quote":
      return stripHtml(b.html);
    case "list":
      return b.items.map(stripHtml).join("\n");
    case "table":
      return b.rows.map((r) => r.map(stripHtml).join(" ")).join("\n");
    case "image":
      return b.caption;
  }
}

// 検索語は空白(全角含む)で区切り、すべて含むものだけを対象にする(AND検索)
export const parseQuery = (q: string) =>
  normalize(q)
    .split(/\s+/)
    .filter(Boolean);

export type SearchHit = { match: boolean; bodyOnly: boolean };

export function searchManual(m: Manual, terms: string[]): SearchHit {
  if (terms.length === 0) return { match: true, bodyOnly: false };

  const head = normalize([m.taskName, m.department, m.folder, m.author, ...(m.tags ?? [])].join("\n"));
  const body = normalize(
    [
      m.purpose,
      ...m.sections.flatMap((s) => [
        s.title,
        ...(s.blocks ?? []).map(blockText),
        ...s.items.flatMap((it) => [
          it.title,
          ...it.blocks.map(blockText),
          ...it.children.flatMap((c) => [c.title, ...c.blocks.map(blockText)]),
        ]),
      ]),
    ].join("\n"),
  );

  const all = `${head}\n${body}`;
  if (!terms.every((t) => all.includes(t))) return { match: false, bodyOnly: false };
  return { match: true, bodyOnly: !terms.every((t) => head.includes(t)) };
}
