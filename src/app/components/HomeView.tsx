import { ArrowUpRight, BookOpen, FolderPlus, MoreHorizontal, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { Manual } from "../types";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  manuals: Manual[];
  categories: string[];
  onSelectCategory: (category: string) => void;
  onAddCategory: () => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
};

const ACCENTS = [
  { dot: "bg-orange-500", soft: "bg-orange-50" },
  { dot: "bg-sky-500", soft: "bg-sky-50" },
  { dot: "bg-violet-500", soft: "bg-violet-50" },
  { dot: "bg-emerald-500", soft: "bg-emerald-50" },
  { dot: "bg-rose-500", soft: "bg-rose-50" },
  { dot: "bg-indigo-500", soft: "bg-indigo-50" },
];

export function HomeView({
  manuals,
  categories,
  onSelectCategory,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: Props) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of categories) m.set(c, 0);
    for (const x of manuals) m.set(x.category, (m.get(x.category) ?? 0) + 1);
    return m;
  }, [manuals, categories]);

  const recent = useMemo(() => manuals.slice(0, 3), [manuals]);

  return (
    <div className="max-w-5xl mx-auto px-10 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-muted-foreground mb-3">
          <Sparkles className="size-3.5" />
          Internal Knowledge Base
        </div>
        <h1 className="tracking-tight">業務マニュアル</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          部署ごとの業務手順をまとめた社内マニュアル集。カテゴリーを選んで一覧を表示します。
        </p>
      </div>

      <div className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="tracking-tight">カテゴリー</h3>
          <span className="text-sm text-muted-foreground">{categories.length} 件</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, i) => {
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <Card
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className="group cursor-pointer p-5 hover:border-foreground/20 hover:shadow-sm transition-all relative"
              >
                <div className="flex items-start justify-between">
                  <div className={`size-9 rounded-lg ${a.soft} flex items-center justify-center`}>
                    <span className={`size-2 rounded-full ${a.dot}`} />
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="size-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            const v = prompt("新しいカテゴリー名", cat);
                            if (v) onRenameCategory(cat, v);
                          }}
                        >
                          <Pencil className="size-3.5" />
                          名前を変更
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteCategory(cat)}
                          className="gap-2 text-rose-600 focus:text-rose-700"
                        >
                          <Trash2 className="size-3.5" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="font-medium tracking-tight">{cat}</div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <BookOpen className="size-3.5" />
                    {counts.get(cat) ?? 0} 件のマニュアル
                  </div>
                </div>
              </Card>
            );
          })}

          <button
            onClick={onAddCategory}
            className="group flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-foreground/30 hover:bg-muted/40 transition-colors p-5 text-muted-foreground hover:text-foreground min-h-[140px]"
          >
            <FolderPlus className="size-5" />
            <span className="font-medium">カテゴリーを追加</span>
          </button>
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="tracking-tight">最近のマニュアル</h3>
          </div>
          <div className="divide-y rounded-xl border bg-card overflow-hidden">
            {recent.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectCategory(m.category)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{m.taskName}</div>
                  <div className="text-sm text-muted-foreground truncate mt-0.5">
                    {m.category} · {m.genre} · {m.author}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground shrink-0">{m.updatedAt}</div>
                <ArrowUpRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
