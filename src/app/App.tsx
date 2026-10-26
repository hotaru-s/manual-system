import { Download, Home, Pencil, Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CategoryView } from "./components/CategoryView";
import { HomeView } from "./components/HomeView";
import { ManualSidebar } from "./components/ManualSidebar";
import { ManualView } from "./components/ManualView";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { initialManuals } from "./data";
import { exportAllManualsToPdf, exportManualToPdf } from "./pdfExport";
import type { Manual } from "./types";

const STORAGE_KEY = "manual-site-v4";
const uid = () => Math.random().toString(36).slice(2, 9);

type Stored = { manuals: Manual[]; categories: string[] };

function migrate(data: any): Stored {
  const raw = Array.isArray(data) ? { manuals: data, categories: [] } : data ?? {};
  const manuals: Manual[] = (raw.manuals ?? []).map((m: any) => ({
    ...m,
    sections: (m.sections ?? []).map((s: any) => ({
      ...s,
      items: (s.items ?? []).map((it: any) => ({
        id: it.id,
        title: it.title ?? "",
        blocks: Array.isArray(it.blocks)
          ? it.blocks
          : it.body
          ? [{ id: uid(), type: "text", html: it.body }]
          : [],
        children: (it.children ?? []).map((c: any) => ({
          id: c.id,
          title: c.title ?? "",
          blocks: Array.isArray(c.blocks)
            ? c.blocks
            : c.body
            ? [{ id: uid(), type: "text", html: c.body }]
            : [],
        })),
      })),
    })),
  }));
  const fromManuals = Array.from(new Set(manuals.map((m) => m.category)));
  const stored = Array.isArray(raw.categories) ? raw.categories : [];
  const categories = Array.from(new Set([...stored, ...fromManuals]));
  return { manuals, categories };
}

type View = { type: "home" } | { type: "category"; category: string } | { type: "manual"; id: string };

export default function App() {
  const initial = useMemo<Stored>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch {}
    return migrate({ manuals: initialManuals, categories: [] });
  }, []);

  const [manuals, setManuals] = useState<Manual[]>(initial.manuals);
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [view, setView] = useState<View>({ type: "home" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ manuals, categories }));
  }, [manuals, categories]);

  const updateManual = (m: Manual) => {
    setManuals((prev) => prev.map((x) => (x.id === m.id ? m : x)));
    if (!categories.includes(m.category)) {
      setCategories((c) => [...c, m.category]);
    }
  };

  const createManual = (category?: string) => {
    const cat = category ?? (view.type === "category" ? view.category : categories[0] ?? "新規カテゴリ");
    const m: Manual = {
      id: uid(),
      category: cat,
      genre: "基本情報",
      author: "未設定",
      taskName: "新しいマニュアル",
      updatedAt: new Date().toLocaleDateString("ja-JP"),
      purpose: "目的を入力してください。",
      sections: [
        {
          id: uid(),
          title: "新しいセクション",
          items: [{ id: uid(), title: "項目タイトル", blocks: [], children: [] }],
        },
      ],
    };
    if (!categories.includes(cat)) setCategories((c) => [...c, cat]);
    setManuals((p) => [m, ...p]);
    setView({ type: "manual", id: m.id });
    setEditing(true);
  };

  const deleteManual = () => {
    if (view.type !== "manual") return;
    const target = manuals.find((m) => m.id === view.id);
    const remaining = manuals.filter((m) => m.id !== view.id);
    setManuals(remaining);
    setEditing(false);
    setView(target ? { type: "category", category: target.category } : { type: "home" });
    toast.success("マニュアルを削除しました");
  };

  const addCategory = () => {
    let base = "新規カテゴリ";
    let name = base;
    let n = 1;
    while (categories.includes(name)) {
      n += 1;
      name = `${base} ${n}`;
    }
    setCategories((c) => [...c, name]);
    toast.success(`「${name}」を作成しました`);
  };

  const renameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    if (categories.includes(trimmed)) {
      toast.error("同名のカテゴリーが既に存在します");
      return;
    }
    setCategories((c) => c.map((x) => (x === oldName ? trimmed : x)));
    setManuals((p) => p.map((m) => (m.category === oldName ? { ...m, category: trimmed } : m)));
    setView((v) => (v.type === "category" && v.category === oldName ? { type: "category", category: trimmed } : v));
    toast.success("カテゴリー名を変更しました");
  };

  const deleteCategory = (name: string) => {
    const count = manuals.filter((m) => m.category === name).length;
    if (count > 0) {
      if (!confirm(`「${name}」には ${count} 件のマニュアルがあります。すべて削除しますか？`)) return;
    }
    setManuals((p) => p.filter((m) => m.category !== name));
    setCategories((c) => c.filter((x) => x !== name));
    setView({ type: "home" });
    toast.success(`「${name}」を削除しました`);
  };

  const selected = view.type === "manual" ? manuals.find((m) => m.id === view.id) : undefined;

  return (
    <div className="h-screen w-full flex bg-background">
      <ManualSidebar
        manuals={manuals}
        categories={categories}
        selectedId={view.type === "manual" ? view.id : undefined}
        selectedCategory={view.type === "category" ? view.category : undefined}
        onSelect={(id) => {
          setView({ type: "manual", id });
          setEditing(false);
        }}
        onSelectCategory={(c) => {
          setView({ type: "category", category: c });
          setEditing(false);
        }}
        onHome={() => {
          setView({ type: "home" });
          setEditing(false);
        }}
        onCreateManual={(c) => createManual(c)}
        onAddCategory={addCategory}
        onRenameCategory={renameCategory}
        onDeleteCategory={deleteCategory}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b bg-card/60 backdrop-blur flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <button
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
              onClick={() => {
                setView({ type: "home" });
                setEditing(false);
              }}
            >
              <Home className="size-3.5" />
              ホーム
            </button>
            {view.type === "category" && (
              <>
                <span className="text-border">/</span>
                <span className="text-foreground">{view.category}</span>
              </>
            )}
            {view.type === "manual" && selected && (
              <>
                <span className="text-border">/</span>
                <button
                  className="hover:text-foreground transition-colors"
                  onClick={() => {
                    setView({ type: "category", category: selected.category });
                    setEditing(false);
                  }}
                >
                  {selected.category}
                </button>
                <span className="text-border">/</span>
                <span className="truncate max-w-[40ch] text-foreground">{selected.taskName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {view.type === "manual" && selected && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    exportManualToPdf(selected)
                      .then(() => toast.success("PDFをダウンロードしました"))
                      .catch(() => toast.error("PDFの出力に失敗しました"));
                  }}
                >
                  <Download className="size-4" />
                  PDF出力
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (editing) {
                      updateManual({ ...selected, updatedAt: new Date().toLocaleDateString("ja-JP") });
                      toast.success("変更を保存しました");
                    }
                    setEditing(!editing);
                  }}
                >
                  {editing ? (
                    <>
                      <Save className="size-4" />
                      保存して閲覧
                    </>
                  ) : (
                    <>
                      <Pencil className="size-4" />
                      編集する
                    </>
                  )}
                </Button>
              </>
            )}
            {view.type !== "manual" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    exportAllManualsToPdf(manuals)
                      .then(() => toast.success("PDFをダウンロードしました"))
                      .catch(() => toast.error("PDFの出力に失敗しました"));
                  }}
                >
                  <Download className="size-4" />
                  全てPDF出力
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => createManual(view.type === "category" ? view.category : undefined)}
                >
                  <Plus className="size-4" />
                  新規マニュアル
                </Button>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {view.type === "home" && (
            <HomeView
              manuals={manuals}
              categories={categories}
              onSelectCategory={(c) => setView({ type: "category", category: c })}
              onAddCategory={addCategory}
              onRenameCategory={renameCategory}
              onDeleteCategory={deleteCategory}
            />
          )}
          {view.type === "category" && (
            <CategoryView
              category={view.category}
              manuals={manuals.filter((m) => m.category === view.category)}
              onBack={() => setView({ type: "home" })}
              onOpen={(id) => setView({ type: "manual", id })}
              onCreate={() => createManual(view.category)}
              onRename={(newName) => renameCategory(view.category, newName)}
              onDelete={() => deleteCategory(view.category)}
            />
          )}
          {view.type === "manual" && selected && (
            <ManualView
              key={selected.id}
              manual={selected}
              editing={editing}
              onChange={updateManual}
              onDelete={deleteManual}
              onBack={() => setView({ type: "category", category: selected.category })}
            />
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
