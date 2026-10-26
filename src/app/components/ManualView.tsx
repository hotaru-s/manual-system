import {
  Building2,
  CalendarDays,
  ChevronLeft,
  FileText,
  Folder,
  Layers,
  ListPlus,
  ListTree,
  Plus,
  Sparkles,
  Target,
  Trash2,
  User,
} from "lucide-react";
import { useMemo } from "react";
import type { Item, Manual, Section, SubItem } from "../types";
import { BlockList } from "./blocks/Blocks";
import { EditableText } from "./EditableText";
import { TagList } from "./TagList";
import { Button } from "./ui/button";

type Props = {
  manual: Manual;
  editing: boolean;
  onChange: (m: Manual) => void;
  onDelete: () => void;
  onBack?: () => void;
  onTagClick?: (tag: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export function ManualView({ manual, editing, onChange, onDelete, onBack, onTagClick }: Props) {
  const update = (patch: Partial<Manual>) => onChange({ ...manual, ...patch });
  const updateSection = (id: string, patch: Partial<Section>) =>
    update({ sections: manual.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const tocItems = useMemo(
    () => manual.sections.map((s, i) => ({ id: s.id, label: s.title, index: i + 1 })),
    [manual.sections],
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* === DETAIL HEADER: 紫のべた塗りの帯(グラデーションや模様は使わない)。白いカードが帯の下端にまたがる === */}
      <div className="bg-primary text-primary-foreground">
        <div className="relative mx-auto max-w-4xl px-10 pb-28 pt-4">
          <div className="flex items-center justify-between">
            {onBack ? (
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 gap-1 text-white/80 hover:bg-white/15 hover:text-white"
                onClick={onBack}
              >
                <ChevronLeft className="size-4" />
                {manual.folder}
              </Button>
            ) : (
              <span />
            )}
            {editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="gap-1.5 text-white hover:bg-white/15 hover:text-white"
              >
                <Trash2 className="size-4" />
                マニュアルを削除
              </Button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-6">
            <FileText className="size-20 shrink-0" strokeWidth={1.5} />

            <div className="min-w-0 flex-1 basis-72">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1">
                  <Building2 className="size-3.5" />
                  <EditableText
                    tone="onBrand"
                    value={manual.department}
                    onChange={(v) => update({ department: v })}
                    editing={editing}
                  />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1">
                  <Folder className="size-3.5" />
                  <EditableText
                    tone="onBrand"
                    value={manual.folder}
                    onChange={(v) => update({ folder: v })}
                    editing={editing}
                  />
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
                <EditableText
                  tone="onBrand"
                  value={manual.taskName}
                  onChange={(v) => update({ taskName: v })}
                  editing={editing}
                  placeholder="任務名を入力"
                />
              </h1>
              {(editing || (manual.tags ?? []).length > 0) && (
                <div className="mt-3">
                  <TagList
                    tone="onBrand"
                    tags={manual.tags ?? []}
                    editing={editing}
                    onChange={(tags) => update({ tags })}
                    onTagClick={onTagClick}
                  />
                </div>
              )}
            </div>

            <div className="flex items-stretch gap-6">
              <HeaderStat icon={<User className="size-3.5" />} label="作成者">
                <EditableText tone="onBrand" value={manual.author} onChange={(v) => update({ author: v })} editing={editing} />
              </HeaderStat>
              <div className="w-px bg-white/25" />
              <HeaderStat icon={<CalendarDays className="size-3.5" />} label="最終改定日">
                <EditableText
                  tone="onBrand"
                  value={manual.updatedAt}
                  onChange={(v) => update({ updatedAt: v })}
                  editing={editing}
                />
              </HeaderStat>
            </div>
          </div>
        </div>
      </div>

      {/* 帯の下端にまたがる白いカード: 目的と目次 */}
      <div className="relative mx-auto -mt-20 grid max-w-4xl gap-5 px-10 md:grid-cols-2">
        <section className="rounded-2xl bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="size-5" />
            </div>
            <div>
              <h3 className="leading-tight tracking-tight">目的</h3>
              <div className="text-[10px] tracking-[0.14em] text-muted-foreground">PURPOSE</div>
            </div>
          </div>
          <div className="leading-relaxed">
            <EditableText
              value={manual.purpose}
              onChange={(v) => update({ purpose: v })}
              editing={editing}
              multiline
              placeholder="任務目的"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-card">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ListTree className="size-5" />
            </div>
            <div>
              <h3 className="leading-tight tracking-tight">目次</h3>
              <div className="text-[10px] tracking-[0.14em] text-muted-foreground">{tocItems.length} SECTIONS</div>
            </div>
          </div>
          {tocItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">セクションがまだありません</div>
          ) : (
            <div className="max-h-72 space-y-0.5 overflow-auto">
              {tocItems.map((t) => (
                <button
                  key={t.id}
                  onClick={() => scrollTo(t.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-secondary"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold tabular-nums text-primary-foreground">
                    {t.index}
                  </span>
                  <span className="truncate text-sm font-medium">{t.label || "（無題）"}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* === ARTICLE BODY === */}
      <div className="max-w-4xl mx-auto px-10 py-10 space-y-10">
        {editing && (
          <div className="rounded-xl bg-primary/10 px-4 py-3 flex items-center gap-2.5 text-sm text-primary">
            <Sparkles className="size-4 shrink-0" />
            <span>編集モード中 — テキストをクリックして編集、ブロックをホバーして並び替え・削除できます。</span>
          </div>
        )}

        {manual.sections.map((section, sIdx) => (
          <SectionBlock
            key={section.id}
            section={section}
            index={sIdx}
            editing={editing}
            onChange={(patch) => updateSection(section.id, patch)}
            onDelete={() => update({ sections: manual.sections.filter((s) => s.id !== section.id) })}
          />
        ))}

        {editing && (
          <button
            onClick={() =>
              update({
                sections: [
                  ...manual.sections,
                  {
                    id: uid(),
                    title: "新しいセクション",
                    items: [{ id: uid(), title: "項目タイトル", blocks: [], children: [] }],
                  },
                ],
              })
            }
            className="w-full rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors py-6 flex items-center justify-center gap-2 text-primary"
          >
            <Plus className="size-4" />
            セクションを追加
          </button>
        )}
      </div>
    </div>
  );
}

// 帯の右側に置く、大きめの数値風の表示(作成者・最終改定日)
function HeaderStat({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-xs text-white/70">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold leading-tight tracking-tight">{children}</div>
    </div>
  );
}

function SectionBlock({
  section,
  index,
  editing,
  onChange,
  onDelete,
}: {
  section: Section;
  index: number;
  editing: boolean;
  onChange: (p: Partial<Section>) => void;
  onDelete: () => void;
}) {
  return (
    <section id={section.id} className="scroll-mt-6 group/section">
      <div className="flex items-center gap-4 mb-6">
        <span className="shrink-0 inline-flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground text-base font-bold tabular-nums">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-0.5 inline-flex items-center gap-1">
            <Layers className="size-3 text-primary" />
            Section
          </div>
          <EditableText
            value={section.title}
            onChange={(v) => onChange({ title: v })}
            editing={editing}
            placeholder="セクションタイトル"
            className="text-[1.35rem] font-semibold tracking-tight leading-tight"
          />
        </div>
        {editing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="opacity-0 group-hover/section:opacity-100 transition-opacity text-muted-foreground hover:text-rose-600 gap-1.5"
          >
            <Trash2 className="size-3.5" />
            セクション削除
          </Button>
        )}
      </div>

      <div className="space-y-8 pl-14 border-l-2 border-primary/15 ml-5">
        {(section.blocks?.length ?? 0) > 0 || editing ? (
          <div className="text-muted-foreground">
            <BlockList
              blocks={section.blocks ?? []}
              onChange={(blocks) => onChange({ blocks })}
              editing={editing}
            />
          </div>
        ) : null}
        {section.items.map((item, iIdx) => (
          <ItemBlock
            key={item.id}
            item={item}
            sectionIndex={index}
            itemIndex={iIdx}
            editing={editing}
            onChange={(updated) =>
              onChange({ items: section.items.map((it) => (it.id === item.id ? updated : it)) })
            }
            onDelete={() => onChange({ items: section.items.filter((it) => it.id !== item.id) })}
          />
        ))}
        {editing && (
          <button
            onClick={() =>
              onChange({
                items: [
                  ...section.items,
                  { id: uid(), title: "新しい項目", blocks: [], children: [] },
                ],
              })
            }
            className="w-full rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors py-2.5 flex items-center justify-center gap-1.5 text-sm text-primary"
          >
            <ListPlus className="size-4" />
            項目を追加
          </button>
        )}
      </div>
    </section>
  );
}

function ItemBlock({
  item,
  sectionIndex,
  itemIndex,
  editing,
  onChange,
  onDelete,
}: {
  item: Item;
  sectionIndex: number;
  itemIndex: number;
  editing: boolean;
  onChange: (it: Item) => void;
  onDelete: () => void;
}) {
  const update = (patch: Partial<Item>) => onChange({ ...item, ...patch });

  return (
    <div className="group/item relative -ml-3 pl-3">
      <div className="flex items-center gap-3 pb-3 border-b border-primary/30">
        <span className="shrink-0 inline-flex items-center justify-center h-8 px-2.5 rounded-md bg-primary text-primary-foreground text-sm tabular-nums font-semibold tracking-tight shadow-sm">
          {sectionIndex + 1}.{itemIndex + 1}
        </span>
        <div className="flex-1 min-w-0">
          <EditableText
            value={item.title}
            onChange={(v) => update({ title: v })}
            editing={editing}
            placeholder="項目タイトル"
            className="font-semibold text-[1.15rem] tracking-tight text-foreground leading-tight"
          />
        </div>
        {editing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="opacity-0 group-hover/item:opacity-100 transition-opacity h-7 px-2 text-muted-foreground hover:text-rose-600"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="pl-2 mt-4 text-muted-foreground">
        <BlockList
          blocks={item.blocks}
          onChange={(blocks) => update({ blocks })}
          editing={editing}
        />
      </div>

      {/* Sub-items */}
      {(item.children?.length ?? 0) > 0 && (
        <div className="pl-2 mt-4 space-y-3">
          {item.children.map((sub, subIdx) => (
            <div
              key={sub.id}
              className="group/sub relative rounded-lg bg-secondary/70 px-4 py-3"
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-xs text-muted-foreground mt-1">
                  {sectionIndex + 1}-{itemIndex + 1}-{subIdx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <EditableText
                    value={sub.title}
                    onChange={(v) =>
                      update({
                        children: item.children.map((c) => (c.id === sub.id ? { ...c, title: v } : c)),
                      })
                    }
                    editing={editing}
                    placeholder="小項目タイトル"
                    className="font-medium text-sm"
                  />
                </div>
                {editing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => update({ children: item.children.filter((c) => c.id !== sub.id) })}
                    className="opacity-0 group-hover/sub:opacity-100 transition-opacity h-6 px-1.5"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
              <div className="mt-1.5 pl-6">
                <BlockList
                  blocks={(sub as SubItem).blocks}
                  onChange={(blocks) =>
                    update({ children: item.children.map((c) => (c.id === sub.id ? { ...c, blocks } : c)) })
                  }
                  editing={editing}
                  compact
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="pl-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-primary h-7"
            onClick={() =>
              update({
                children: [...(item.children ?? []), { id: uid(), title: "新しい小項目", blocks: [] }],
              })
            }
          >
            <Plus className="size-3.5" />
            小項目を追加
          </Button>
        </div>
      )}
    </div>
  );
}
