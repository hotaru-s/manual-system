import {
  BookOpen,
  ChevronRight,
  FilePlus,
  Folder,
  FolderOpen,
  FolderPlus,
  Home,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Manual } from "../types";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";

type Props = {
  manuals: Manual[];
  categories: string[];
  selectedId?: string;
  selectedCategory?: string;
  onSelect: (id: string) => void;
  onSelectCategory: (c: string) => void;
  onHome: () => void;
  onCreateManual: (category?: string) => void;
  onAddCategory: () => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
};

export function ManualSidebar({
  manuals,
  categories,
  selectedId,
  selectedCategory,
  onSelect,
  onSelectCategory,
  onHome,
  onCreateManual,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: Props) {
  const [q, setQ] = useState("");
  const [openCats, setOpenCats] = useState<Set<string>>(() => new Set(categories));
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renaming]);

  useEffect(() => {
    if (selectedCategory) {
      setOpenCats((prev) => {
        if (prev.has(selectedCategory)) return prev;
        const next = new Set(prev);
        next.add(selectedCategory);
        return next;
      });
    }
  }, [selectedCategory]);

  const byCategory = useMemo(() => {
    const filter = q.toLowerCase();
    const map = new Map<string, Manual[]>();
    for (const c of categories) map.set(c, []);
    for (const m of manuals) {
      if (!map.has(m.category)) map.set(m.category, []);
      const matchText =
        !filter ||
        m.taskName.toLowerCase().includes(filter) ||
        m.category.toLowerCase().includes(filter) ||
        m.genre.toLowerCase().includes(filter) ||
        m.author.toLowerCase().includes(filter);
      if (matchText) map.get(m.category)!.push(m);
    }
    return map;
  }, [manuals, categories, q]);

  const toggle = (c: string) =>
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const startRename = (c: string) => {
    setRenameValue(c);
    setRenaming(c);
  };

  const commitRename = () => {
    if (renaming) onRenameCategory(renaming, renameValue);
    setRenaming(null);
  };

  return (
    <aside className="w-72 shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col h-full">
      <button onClick={onHome} className="px-5 py-5 flex items-center gap-2.5 text-left">
        <div className="size-8 rounded-lg bg-foreground text-background flex items-center justify-center">
          <BookOpen className="size-4" />
        </div>
        <div>
          <div className="font-medium tracking-tight leading-tight">業務マニュアル</div>
          <div className="text-xs text-muted-foreground leading-tight mt-0.5">社内閲覧用</div>
        </div>
      </button>

      <div className="px-3 pb-3 space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="検索"
            className="pl-8 h-9 bg-card"
          />
        </div>
        <Button
          onClick={onHome}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-foreground"
        >
          <Home className="size-3.5" />
          カテゴリ一覧
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 pt-1">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              カテゴリー
            </span>
            <button
              onClick={onAddCategory}
              className="size-5 rounded hover:bg-sidebar-accent inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
              title="カテゴリーを追加"
            >
              <FolderPlus className="size-3.5" />
            </button>
          </div>

          <div className="space-y-px">
            {categories.length === 0 && (
              <div className="px-2.5 py-3 text-xs text-muted-foreground text-center">
                カテゴリーがありません
              </div>
            )}
            {categories.map((cat) => {
              const list = byCategory.get(cat) ?? [];
              const isOpen = openCats.has(cat) || !!q;
              const isActive = selectedCategory === cat;
              return (
                <div key={cat}>
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-md pr-1 hover:bg-sidebar-accent transition-colors",
                      isActive && "bg-sidebar-accent",
                    )}
                  >
                    <button
                      onClick={() => toggle(cat)}
                      className="size-5 inline-flex items-center justify-center text-muted-foreground shrink-0"
                    >
                      <ChevronRight
                        className={cn("size-3.5 transition-transform", isOpen && "rotate-90")}
                      />
                    </button>
                    {renaming === cat ? (
                      <Input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenaming(null);
                        }}
                        className="h-7 text-sm flex-1"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          onSelectCategory(cat);
                          if (!openCats.has(cat)) toggle(cat);
                        }}
                        onDoubleClick={() => startRename(cat)}
                        className="flex-1 flex items-center gap-1.5 py-1.5 text-left text-sm min-w-0"
                      >
                        {isOpen ? (
                          <FolderOpen className="size-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <Folder className="size-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{cat}</span>
                        <span className="text-xs text-muted-foreground ml-auto tabular-nums pr-1">
                          {list.length}
                        </span>
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="size-5 rounded inline-flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background data-[state=open]:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onCreateManual(cat)} className="gap-2">
                          <FilePlus className="size-3.5" />
                          新規マニュアル
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startRename(cat)} className="gap-2">
                          <Pencil className="size-3.5" />
                          名前を変更
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteCategory(cat)}
                          className="gap-2 text-rose-600 focus:text-rose-700"
                        >
                          <Trash2 className="size-3.5" />
                          カテゴリーを削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {isOpen && (
                    <div className="ml-[18px] border-l border-border/70 pl-1.5 mt-0.5 space-y-px">
                      {list.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => onSelect(m.id)}
                          className={cn(
                            "w-full text-left rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors group/m flex items-center gap-2",
                            selectedId === m.id && "bg-sidebar-accent",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full shrink-0 transition-colors",
                              selectedId === m.id
                                ? "bg-foreground"
                                : "bg-border group-hover/m:bg-muted-foreground",
                            )}
                          />
                          <span className="truncate text-sm">{m.taskName}</span>
                        </button>
                      ))}
                      {list.length === 0 && !q && (
                        <button
                          onClick={() => onCreateManual(cat)}
                          className="w-full text-left rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex items-center gap-1.5"
                        >
                          <FilePlus className="size-3" />
                          マニュアルを追加
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={onAddCategory}
            className="w-full mt-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex items-center gap-1.5"
          >
            <FolderPlus className="size-3.5" />
            カテゴリーを追加
          </button>
        </div>
      </ScrollArea>
    </aside>
  );
}
