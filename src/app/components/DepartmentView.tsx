import { Clock, FilePlus, FolderPlus, Pencil, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { sortRecent } from "../manualUtils";
import type { Folder, Manual } from "../types";
import { FolderCard } from "./FolderCard";
import { ManualRow } from "./ManualRow";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  department: string;
  folders: Folder[];
  manuals: Manual[];
  onOpenFolder: (folder: string) => void;
  onOpenManual: (id: string) => void;
  onAddFolder: () => void;
  onRenameFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (name: string) => void;
  onCreateManual: () => void;
  onRename: (newName: string) => void;
};

// フォルダがこれより多いときだけ、フォルダの絞り込み欄を出す
const FILTER_THRESHOLD = 6;

export function DepartmentView({
  department,
  folders,
  manuals,
  onOpenFolder,
  onOpenManual,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onCreateManual,
  onRename,
}: Props) {
  const [query, setQuery] = useState("");

  const recent = useMemo(() => sortRecent(manuals, 5), [manuals]);

  const shown = useMemo(() => {
    const q = query.normalize("NFKC").toLowerCase().trim();
    return folders.filter((f) => !q || f.name.normalize("NFKC").toLowerCase().includes(q));
  }, [folders, query]);

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.14em] text-muted-foreground">DEPARTMENT</div>
          <h1 className="flex items-center gap-2 tracking-tight">
            <span className="truncate">{department}</span>
            <button
              onClick={() => {
                const v = prompt("新しい課の名前", department);
                if (v) onRename(v);
              }}
              className="size-7 shrink-0 rounded-full inline-flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="課の名前を変更"
              aria-label="課の名前を変更"
            >
              <Pencil className="size-3.5" />
            </button>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5" onClick={onAddFolder}>
            <FolderPlus className="size-4" />
            フォルダを追加
          </Button>
          <Button className="gap-1.5" onClick={onCreateManual}>
            <FilePlus className="size-4" />
            新規マニュアル
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="tracking-tight">
          フォルダ <span className="ml-1 text-sm font-normal text-muted-foreground">{folders.length}</span>
        </h3>
        {folders.length > FILTER_THRESHOLD && (
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (!e.nativeEvent.isComposing && e.key === "Escape") setQuery("");
              }}
              placeholder="フォルダを検索"
              className="h-9 rounded-full pl-9 pr-8 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 size-6 -translate-y-1/2 rounded-full inline-flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                title="検索をクリア"
                aria-label="検索をクリア"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {folders.length === 0 ? (
        <button
          onClick={onAddFolder}
          className="w-full rounded-2xl bg-card py-12 text-primary shadow-card transition-shadow hover:shadow-card-hover"
        >
          <FolderPlus className="mx-auto mb-2 size-8" />
          最初のフォルダを追加する
        </button>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl bg-card py-12 text-center text-muted-foreground shadow-card">
          該当するフォルダがありません
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((f) => (
            <FolderCard
              key={f.name}
              name={f.name}
              count={manuals.filter((m) => m.folder === f.name).length}
              onOpen={() => onOpenFolder(f.name)}
              onRename={(v) => onRenameFolder(f.name, v)}
              onDelete={() => onDeleteFolder(f.name)}
            />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4 flex items-center gap-2 tracking-tight">
            <Clock className="size-5 text-primary" />
            最近のマニュアル
          </h3>
          <div className="space-y-2">
            {recent.map((m, i) => (
              <ManualRow
                key={m.id}
                manual={m}
                isNew={i === 0}
                onOpen={() => onOpenManual(m.id)}
                showPath
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
