import {
  CalendarDays,
  ChevronLeft,
  Hash,
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
import { Button } from "./ui/button";

type Props = {
  manual: Manual;
  editing: boolean;
  onChange: (m: Manual) => void;
  onDelete: () => void;
  onBack?: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export function ManualView({ manual, editing, onChange, onDelete, onBack }: Props) {
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
      {/* === DETAIL HEADER (refined, light) === */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-10 pt-8 pb-10">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 -ml-2 mb-6 text-muted-foreground hover:text-foreground"
              onClick={onBack}
            >
              <ChevronLeft className="size-4" />
              一覧に戻る
            </Button>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-muted-foreground">
              <Hash className="size-3" />
              <EditableText value={manual.category} onChange={(v) => update({ category: v })} editing={editing} />
              <span className="text-border">/</span>
              <EditableText value={manual.genre} onChange={(v) => update({ genre: v })} editing={editing} />
            </span>
            <div className="flex-1" />
            {editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5"
              >
                <Trash2 className="size-4" />
                マニュアルを削除
              </Button>
            )}
          </div>

          <h1 className="tracking-tight text-[1.75rem] leading-tight">
            <EditableText
              value={manual.taskName}
              onChange={(v) => update({ taskName: v })}
              editing={editing}
              placeholder="任務名を入力"
            />
          </h1>

          <div className="mt-4 flex items-start gap-2.5 text-muted-foreground max-w-2xl">
            <Target className="size-4 mt-1 shrink-0" />
            <div className="flex-1 leading-relaxed">
              <EditableText
                value={manual.purpose}
                onChange={(v) => update({ purpose: v })}
                editing={editing}
                multiline
                placeholder="任務目的"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-8 text-sm">
            <Meta icon={<User className="size-3.5" />} label="作成者">
              <EditableText value={manual.author} onChange={(v) => update({ author: v })} editing={editing} />
            </Meta>
            <Meta icon={<CalendarDays className="size-3.5" />} label="最終改定日">
              <EditableText value={manual.updatedAt} onChange={(v) => update({ updatedAt: v })} editing={editing} />
            </Meta>
          </div>
        </div>
      </div>

      {/* === ARTICLE BODY === */}
      <div className="max-w-4xl mx-auto px-10 py-10 space-y-10">
        {/* TOC */}
        <div>
          <div className="text-xs tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
            <ListTree className="size-3.5" />
            目次
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tocItems.map((t) => (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                className="group inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm hover:border-foreground hover:shadow-sm transition-all"
              >
                <span className="text-muted-foreground group-hover:text-foreground text-xs tabular-nums transition-colors">
                  {String(t.index).padStart(2, "0")}
                </span>
                {t.label || "（無題）"}
              </button>
            ))}
            {tocItems.length === 0 && (
              <span className="text-sm text-muted-foreground">セクションがまだありません</span>
            )}
          </div>
        </div>

        {editing && (
          <div className="rounded-xl border bg-amber-50/50 border-amber-200 px-4 py-3 flex items-center gap-2.5 text-sm text-amber-900">
            <Sparkles className="size-4 text-amber-600 shrink-0" />
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
            className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors py-6 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Plus className="size-4" />
            セクションを追加
          </button>
        )}
      </div>
    </div>
  );
}

function Meta({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        <span className="text-xs">{label}</span>
      </span>
      <span className="text-foreground">{children}</span>
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
        <span className="shrink-0 inline-flex items-center justify-center size-10 rounded-lg bg-foreground text-background text-base font-medium tabular-nums">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
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

      <div className="space-y-8 pl-14 border-l-2 ml-5">
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
            className="w-full rounded-lg border border-dashed hover:border-foreground/30 hover:bg-muted/40 transition-colors py-2.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" />
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
      <div className="flex items-center gap-3 pb-3 border-b-2 border-foreground/80">
        <span className="shrink-0 inline-flex items-center justify-center h-8 px-2.5 rounded-md bg-foreground text-background text-sm tabular-nums font-semibold tracking-tight shadow-sm">
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
              className="group/sub relative rounded-lg border bg-muted/30 px-4 py-3"
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
            className="gap-2 text-muted-foreground h-7"
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
