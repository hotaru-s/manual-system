import { initialManuals, LEGACY_SEED_IDS } from "./data";
import type { Folder, Manual } from "./types";

// v5: 課 → フォルダ → マニュアル の形式
const KEY = "manual-site-v5";
// v4: 旧形式(カテゴリー → マニュアル)。移行元として読むだけで、書き換えも削除もしない
const LEGACY_KEY = "manual-site-v4";

export type Stored = {
  manuals: Manual[];
  departments: string[];
  folders: Folder[];
  // 追加済みのサンプルマニュアルのID。ユーザーが消したサンプルを復活させないために覚えておく
  seeded: string[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

function normalizeManual(m: any): Manual {
  const { category, genre, ...rest } = m;
  return {
    ...rest,
    // 旧形式: カテゴリー → 課、ジャンル → フォルダ
    department: m.department ?? category ?? "未設定の課",
    folder: m.folder ?? genre ?? "未分類",
    tags: Array.isArray(m.tags) ? m.tags : [],
    sections: (m.sections ?? []).map((s: any) => ({
      ...s,
      items: (s.items ?? []).map((it: any) => ({
        id: it.id,
        title: it.title ?? "",
        blocks: Array.isArray(it.blocks) ? it.blocks : it.body ? [{ id: uid(), type: "text", html: it.body }] : [],
        children: (it.children ?? []).map((c: any) => ({
          id: c.id,
          title: c.title ?? "",
          blocks: Array.isArray(c.blocks) ? c.blocks : c.body ? [{ id: uid(), type: "text", html: c.body }] : [],
        })),
      })),
    })),
  };
}

function read(key: string): any | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function load(): Stored {
  let manuals: Manual[];
  let departments: string[];
  let folders: Folder[];
  let seeded: Set<string>;

  const current = read(KEY);
  if (current) {
    manuals = (current.manuals ?? []).map(normalizeManual);
    departments = Array.isArray(current.departments) ? [...current.departments] : [];
    folders = Array.isArray(current.folders) ? [...current.folders] : [];
    seeded = new Set(Array.isArray(current.seeded) ? current.seeded : []);
  } else {
    const legacy = read(LEGACY_KEY);
    const raw = Array.isArray(legacy) ? { manuals: legacy, categories: [] } : legacy;
    manuals = (raw?.manuals ?? []).map(normalizeManual);
    departments = Array.isArray(raw?.categories) ? [...raw.categories] : [];
    folders = [];
    // 旧データの「追加済み」の記録は信用せず、最初から入っていたサンプル以外は入れ直す
    seeded = new Set(raw ? LEGACY_SEED_IDS : []);
  }

  // まだ追加していないサンプルマニュアルだけを足す
  const have = new Set(manuals.map((m) => m.id));
  const added = initialManuals.filter((m) => !seeded.has(m.id) && !have.has(m.id)).map(normalizeManual);
  manuals = [...manuals, ...added];
  for (const m of initialManuals) seeded.add(m.id);

  // マニュアルが属する課とフォルダは、必ず存在させる
  for (const m of manuals) {
    if (!departments.includes(m.department)) departments.push(m.department);
    if (!folders.some((f) => f.department === m.department && f.name === m.folder)) {
      folders.push({ department: m.department, name: m.folder });
    }
  }

  return { manuals, departments, folders, seeded: Array.from(seeded) };
}

export function save(s: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // 容量超過などで保存できなくても、画面は動かし続ける
  }
}
