import type { Manual } from "./types";

// "2025/7/25" や "2025-07-25" を日付の大小で比べられる数値にする(読めなければ最古扱い)
export const dateValue = (s: string) => {
  const t = Date.parse(String(s ?? "").replace(/[.-]/g, "/"));
  return Number.isNaN(t) ? 0 : t;
};

// 更新日の新しい順。同じ日付なら元の並びを保つ
export function sortRecent(manuals: Manual[], limit?: number): Manual[] {
  const sorted = manuals
    .map((m, i) => ({ m, i }))
    .sort((a, b) => dateValue(b.m.updatedAt) - dateValue(a.m.updatedAt) || a.i - b.i)
    .map(({ m }) => m);
  return limit === undefined ? sorted : sorted.slice(0, limit);
}

// 既存の名前と重ならない名前にする(例: 新規フォルダ → 新規フォルダ 2)
export function uniqueName(base: string, existing: string[]) {
  let name = base;
  let n = 1;
  while (existing.includes(name)) {
    n += 1;
    name = `${base} ${n}`;
  }
  return name;
}
