import {
  Building2,
  Check,
  ChevronRight,
  ChevronsUpDown,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Home,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import logoMark from "../../assets/logo/logo-mark.svg";
import { parseQuery, searchManual, type SearchHit } from "../search";
import type { Folder as FolderType, Manual } from "../types";
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
  departments: string[];
  folders: FolderType[];
  currentDepartment?: string;
  selectedId?: string;
  selectedFolder?: string;
  query: string;
  onQueryChange: (q: string) => void;
  onHome: () => void;
  onSelectDepartment: (department: string) => void;
  onSelectFolder: (department: string, folder: string) => void;
  onSelectManual: (id: string) => void;
  onAddDepartment: () => void;
  onAddFolder: (department: string) => void;
  onCreateManual: (department: string, folder: string) => void;
  onRenameFolder: (department: string, oldName: string, newName: string) => void;
  onDeleteFolder: (department: string, name: string) => void;
};

const rowBase = "w-full text-left rounded-lg px-2 py-1.5 transition-colors flex items-center gap-2 text-sm";
const rowIdle = "text-foreground/80 hover:bg-secondary hover:text-foreground";
const rowActive = "bg-primary/10 text-primary font-medium";

export function ManualSidebar({
  manuals,
  departments,
  folders,
  currentDepartment,
  selectedId,
  selectedFolder,
  query,
  onQueryChange,
  onHome,
  onSelectDepartment,
  onSelectFolder,
  onSelectManual,
  onAddDepartment,
  onAddFolder,
  onCreateManual,
  onRenameFolder,
  onDeleteFolder,
}: Props) {
  const terms = useMemo(() => parseQuery(query), [query]);
  const searching = terms.length > 0;
  const [open, setOpen] = useState<Set<string>>(new Set());

  const selected = manuals.find((m) => m.id === selectedId);
  // 選んでいるマニュアルのフォルダは、自動で開く
  useEffect(() => {
    if (!selected) return;
    const key = `${selected.department}/${selected.folder}`;
    setOpen((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, [selected?.department, selected?.folder]);

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // 検索は全部の課が対象。ヒットしたものを一覧で出す
  const { results, hits } = useMemo(() => {
    const hits = new Map<string, SearchHit>();
    const results: Manual[] = [];
    if (terms.length === 0) return { results, hits };
    for (const m of manuals) {
      const hit = searchManual(m, terms);
      if (!hit.match) continue;
      hits.set(m.id, hit);
      results.push(m);
    }
    return { results, hits };
  }, [manuals, terms]);

  const myFolders = folders.filter((f) => f.department === currentDepartment);
  const inFolder = (name: string) =>
    manuals.filter((m) => m.department === currentDepartment && m.folder === name);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <button onClick={onHome} className="flex items-center gap-2.5 px-5 py-5 text-left">
        <img src={logoMark} alt="" className="h-7 w-auto shrink-0" />
        <div>
          <div className="font-bold leading-tight tracking-tight">テビキ</div>
          <div className="mt-0.5 text-xs leading-tight text-muted-foreground">業務マニュアル管理システム</div>
        </div>
      </button>

      <div className="space-y-2 px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              // 日本語入力の変換確定のEnterでは動かさない
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Enter" && results[0]) onSelectManual(results[0].id);
              if (e.key === "Escape") onQueryChange("");
            }}
            placeholder="タイトル・本文・タグで検索"
            className="h-9 rounded-full pl-9 pr-8 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="検索をクリア"
              aria-label="検索をクリア"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        {searching && (
          <div className="px-1 text-xs text-muted-foreground">
            {results.length > 0 ? `${results.length} 件ヒット(Enterで先頭を開く)` : "該当するマニュアルがありません"}
          </div>
        )}

        {!searching && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-xl bg-secondary px-3 py-2 text-left transition-colors hover:bg-primary/10">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                  <Building2 className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] leading-none tracking-[0.14em] text-muted-foreground">DEPARTMENT</span>
                  <span className="mt-1 block truncate text-sm font-medium">
                    {currentDepartment ?? "課を選ぶ"}
                  </span>
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {departments.map((d) => (
                <DropdownMenuItem key={d} className="gap-2" onClick={() => onSelectDepartment(d)}>
                  <Building2 className="size-3.5" />
                  <span className="flex-1 truncate">{d}</span>
                  {d === currentDepartment && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
              {departments.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem className="gap-2" onClick={onHome}>
                <Home className="size-3.5" />
                課の一覧へ
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={onAddDepartment}>
                <Plus className="size-3.5" />
                課を追加
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pb-4">
          {searching ? (
            <div className="space-y-0.5">
              {results.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectManual(m.id)}
                  className={cn(rowBase, "items-start", selectedId === m.id ? rowActive : rowIdle)}
                >
                  <FileText className="mt-0.5 size-3.5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{m.taskName}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {m.department} / {m.folder}
                    </span>
                  </span>
                  {hits.get(m.id)?.bodyOnly && (
                    <span className="mt-0.5 shrink-0 rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">本文</span>
                  )}
                </button>
              ))}
            </div>
          ) : currentDepartment ? (
            <>
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-[10px] tracking-[0.14em] text-muted-foreground">FOLDERS</span>
                <button
                  onClick={() => onAddFolder(currentDepartment)}
                  className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title="フォルダを追加"
                  aria-label="フォルダを追加"
                >
                  <FolderPlus className="size-3.5" />
                </button>
              </div>

              {myFolders.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">フォルダがありません</div>
              )}

              <div className="space-y-0.5">
                {myFolders.map((f) => {
                  const key = `${currentDepartment}/${f.name}`;
                  const list = inFolder(f.name);
                  const isOpen = open.has(key);
                  const isActive = selectedFolder === f.name && !selectedId;
                  return (
                    <div key={key}>
                      <div className={cn("group flex items-center rounded-lg pr-1 transition-colors", isActive ? "bg-primary/10" : "hover:bg-secondary")}>
                        <button
                          onClick={() => toggle(key)}
                          className="inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground"
                          aria-label={isOpen ? "閉じる" : "開く"}
                        >
                          <ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90")} />
                        </button>
                        <button
                          onClick={() => {
                            onSelectFolder(currentDepartment, f.name);
                            if (!isOpen) toggle(key);
                          }}
                          className={cn(
                            "flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm",
                            isActive ? "font-medium text-primary" : "text-foreground/80",
                          )}
                        >
                          {isOpen ? <FolderOpen className="size-3.5 shrink-0" /> : <Folder className="size-3.5 shrink-0" />}
                          <span className="truncate">{f.name}</span>
                          <span className="ml-auto pr-1 text-xs tabular-nums text-muted-foreground">{list.length}</span>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 hover:bg-card group-hover:opacity-100 data-[state=open]:opacity-100"
                              aria-label={`フォルダ「${f.name}」のメニュー`}
                            >
                              <MoreHorizontal className="size-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem className="gap-2" onClick={() => onCreateManual(currentDepartment, f.name)}>
                              <FilePlus className="size-3.5" />
                              新規マニュアル
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => {
                                const v = prompt("新しいフォルダ名", f.name);
                                if (v) onRenameFolder(currentDepartment, f.name, v);
                              }}
                            >
                              <Pencil className="size-3.5" />
                              名前を変更
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteFolder(currentDepartment, f.name)}
                              className="gap-2 text-rose-600 focus:text-rose-700"
                            >
                              <Trash2 className="size-3.5" />
                              フォルダを削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {isOpen && (
                        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-2">
                          {list.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => onSelectManual(m.id)}
                              className={cn(rowBase, selectedId === m.id ? rowActive : rowIdle)}
                            >
                              <FileText className="size-3.5 shrink-0" />
                              <span className="truncate">{m.taskName}</span>
                            </button>
                          ))}
                          {list.length === 0 && (
                            <button
                              onClick={() => onCreateManual(currentDepartment, f.name)}
                              className={cn(rowBase, "text-xs text-muted-foreground hover:bg-secondary")}
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
            </>
          ) : (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              課を追加すると、ここにフォルダが並びます
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
