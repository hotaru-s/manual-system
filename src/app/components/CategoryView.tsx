import { ArrowUpRight, CalendarDays, ChevronLeft, Plus, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Manual } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  category: string;
  manuals: Manual[];
  onBack: () => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
};

export function CategoryView({ category, manuals, onBack, onOpen, onCreate, onRename, onDelete }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [value, setValue] = useState(category);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(category);
  }, [category]);

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming]);

  const commit = () => {
    setRenaming(false);
    if (value.trim() && value.trim() !== category) onRename(value.trim());
  };

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2 mb-6 text-muted-foreground hover:text-foreground"
        onClick={onBack}
      >
        <ChevronLeft className="size-4" />
        カテゴリ一覧へ
      </Button>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs tracking-wider uppercase text-muted-foreground mb-2">カテゴリー</div>
          {renaming ? (
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setValue(category);
                  setRenaming(false);
                }
              }}
              className="h-10 text-2xl font-medium max-w-md"
            />
          ) : (
            <h1
              className="tracking-tight cursor-text hover:bg-muted/50 -mx-1 px-1 rounded inline-block"
              onClick={() => setRenaming(true)}
              title="クリックして名前を変更"
            >
              {category}
            </h1>
          )}
          <p className="text-muted-foreground mt-1.5">{manuals.length} 件の記事があります</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onCreate}>
            <Plus className="size-3.5" />
            新規マニュアル
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="gap-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="size-3.5" />
            カテゴリー削除
          </Button>
        </div>
      </div>

      {manuals.length === 0 ? (
        <button
          onClick={onCreate}
          className="w-full rounded-xl border-2 border-dashed border-border hover:border-foreground/30 hover:bg-muted/40 transition-colors py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-6" />
          <span>このカテゴリーに最初のマニュアルを追加</span>
        </button>
      ) : (
        <div className="divide-y rounded-xl border bg-card overflow-hidden">
          {manuals.map((m) => (
            <button
              key={m.id}
              onClick={() => onOpen(m.id)}
              className="group w-full flex items-center gap-4 px-6 py-5 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="font-normal">
                    {m.genre}
                  </Badge>
                </div>
                <div className="font-medium tracking-tight">{m.taskName}</div>
                <div className="text-sm text-muted-foreground line-clamp-1 mt-1">{m.purpose}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2.5">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {m.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {m.updatedAt}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground shrink-0 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
