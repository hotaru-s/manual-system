import { Building2, FileDown, FilePlus, FileText, Folder, Home, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DepartmentView } from "./components/DepartmentView";
import { FolderView } from "./components/FolderView";
import { HomeView } from "./components/HomeView";
import { ManualSidebar } from "./components/ManualSidebar";
import { ManualView } from "./components/ManualView";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { uniqueName } from "./manualUtils";
import { exportAllManualsToPdf, exportManualToPdf } from "./pdfExport";
import { load, save } from "./storage";
import type { Folder as FolderType, Manual } from "./types";

const uid = () => Math.random().toString(36).slice(2, 9);

// 画面は「ホーム(課を選ぶ) → 課 → フォルダ → マニュアル」の順に深くなる
type View =
  | { type: "home" }
  | { type: "department"; department: string }
  | { type: "folder"; department: string; folder: string }
  | { type: "manual"; id: string };

export default function App() {
  const [initial] = useState(load);
  const [manuals, setManuals] = useState<Manual[]>(initial.manuals);
  const [departments, setDepartments] = useState<string[]>(initial.departments);
  const [folders, setFolders] = useState<FolderType[]>(initial.folders);
  const [seeded] = useState(initial.seeded);
  const [view, setView] = useState<View>({ type: "home" });
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [lastDepartment, setLastDepartment] = useState<string | undefined>(initial.departments[0]);

  useEffect(() => {
    save({ manuals, departments, folders, seeded });
  }, [manuals, departments, folders, seeded]);

  const selected = view.type === "manual" ? manuals.find((m) => m.id === view.id) : undefined;

  // いま見ている課。ホームでは、最後に見ていた課を保つ
  const viewDepartment =
    view.type === "department" || view.type === "folder" ? view.department : selected?.department;
  useEffect(() => {
    if (viewDepartment) setLastDepartment(viewDepartment);
  }, [viewDepartment]);
  const currentDepartment = [viewDepartment, lastDepartment].find((d) => d && departments.includes(d)) ?? departments[0];

  const go = (v: View) => {
    setView(v);
    setEditing(false);
  };

  /* ---------- 課 ---------- */
  const addDepartment = () => {
    const name = uniqueName("新規課", departments);
    setDepartments((d) => [...d, name]);
    toast.success(`「${name}」を作成しました`);
    go({ type: "department", department: name });
  };

  const renameDepartment = (oldName: string, newName: string) => {
    const name = newName.trim();
    if (!name || name === oldName) return;
    if (departments.includes(name)) {
      toast.error("同名の課が既に存在します");
      return;
    }
    setDepartments((d) => d.map((x) => (x === oldName ? name : x)));
    setFolders((f) => f.map((x) => (x.department === oldName ? { ...x, department: name } : x)));
    setManuals((p) => p.map((m) => (m.department === oldName ? { ...m, department: name } : m)));
    setLastDepartment((d) => (d === oldName ? name : d));
    setView((v) => {
      if ((v.type === "department" || v.type === "folder") && v.department === oldName) return { ...v, department: name };
      return v;
    });
    toast.success("課の名前を変更しました");
  };

  const deleteDepartment = (name: string) => {
    const fc = folders.filter((f) => f.department === name).length;
    const mc = manuals.filter((m) => m.department === name).length;
    if (fc + mc > 0 && !confirm(`「${name}」にはフォルダ ${fc} 件、マニュアル ${mc} 件があります。すべて削除しますか？`)) return;
    setDepartments((d) => d.filter((x) => x !== name));
    setFolders((f) => f.filter((x) => x.department !== name));
    setManuals((p) => p.filter((m) => m.department !== name));
    setView((v) => {
      const inside =
        ((v.type === "department" || v.type === "folder") && v.department === name) ||
        (v.type === "manual" && manuals.find((m) => m.id === v.id)?.department === name);
      return inside ? { type: "home" } : v;
    });
    toast.success(`「${name}」を削除しました`);
  };

  /* ---------- フォルダ ---------- */
  const addFolder = (department: string) => {
    const name = uniqueName(
      "新規フォルダ",
      folders.filter((f) => f.department === department).map((f) => f.name),
    );
    setFolders((f) => [...f, { department, name }]);
    toast.success(`「${name}」を作成しました`);
    go({ type: "department", department });
  };

  const renameFolder = (department: string, oldName: string, newName: string) => {
    const name = newName.trim();
    if (!name || name === oldName) return;
    if (folders.some((f) => f.department === department && f.name === name)) {
      toast.error("同名のフォルダが既に存在します");
      return;
    }
    setFolders((f) => f.map((x) => (x.department === department && x.name === oldName ? { ...x, name } : x)));
    setManuals((p) =>
      p.map((m) => (m.department === department && m.folder === oldName ? { ...m, folder: name } : m)),
    );
    setView((v) =>
      v.type === "folder" && v.department === department && v.folder === oldName ? { ...v, folder: name } : v,
    );
    toast.success("フォルダ名を変更しました");
  };

  const deleteFolder = (department: string, name: string) => {
    const count = manuals.filter((m) => m.department === department && m.folder === name).length;
    if (count > 0 && !confirm(`「${name}」には ${count} 件のマニュアルがあります。すべて削除しますか？`)) return;
    setFolders((f) => f.filter((x) => !(x.department === department && x.name === name)));
    setManuals((p) => p.filter((m) => !(m.department === department && m.folder === name)));
    setView((v) =>
      v.type === "folder" && v.department === department && v.folder === name ? { type: "department", department } : v,
    );
    toast.success(`「${name}」を削除しました`);
  };

  /* ---------- マニュアル ---------- */
  // 課やフォルダの名前を編集して、まだ存在しない場所になったときは、その場所を作る
  const ensurePlace = (department: string, folder: string) => {
    setDepartments((d) => (d.includes(department) ? d : [...d, department]));
    setFolders((f) =>
      f.some((x) => x.department === department && x.name === folder) ? f : [...f, { department, name: folder }],
    );
  };

  const updateManual = (m: Manual) => {
    setManuals((prev) => prev.map((x) => (x.id === m.id ? m : x)));
    ensurePlace(m.department, m.folder);
  };

  const createManual = (department?: string, folder?: string) => {
    const dept = department ?? (view.type === "department" || view.type === "folder" ? view.department : currentDepartment);
    if (!dept) {
      toast.error("先に課を追加してください");
      return;
    }
    const inDept = folders.filter((f) => f.department === dept);
    const folderName = folder ?? (view.type === "folder" && view.department === dept ? view.folder : inDept[0]?.name ?? "新規フォルダ");
    const m: Manual = {
      id: uid(),
      department: dept,
      folder: folderName,
      tags: [],
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
    ensurePlace(dept, folderName);
    setManuals((p) => [m, ...p]);
    setView({ type: "manual", id: m.id });
    setEditing(true);
  };

  const deleteManual = () => {
    if (view.type !== "manual" || !selected) return;
    const { department, folder } = selected;
    setManuals((p) => p.filter((m) => m.id !== view.id));
    go({ type: "folder", department, folder });
    toast.success("マニュアルを削除しました");
  };

  const exportPdf = (run: Promise<void>) =>
    run.then(() => toast.success("PDFをダウンロードしました")).catch(() => toast.error("PDFの出力に失敗しました"));

  // パンくずは、リンクも現在地も同じ文字サイズ・太さにして、違いは色だけにする
  // (button は全体設定で文字サイズ・太さが決まるため、ここで明示して揃える)
  const crumbBase = "inline-flex items-center gap-1.5 text-sm font-medium leading-none";
  // マニュアル詳細(閲覧・編集)だけ、上部バーを濃い紫にして白文字にする(紫の帯とつなげるため)。
  // ほかの画面は、背景なし・グレーのリンクのままにする
  const brand = view.type === "manual";
  const crumbButton = `${crumbBase} transition-colors ${
    brand ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-primary"
  }`;
  const crumbCurrent = `${crumbBase} ${brand ? "text-white" : "text-foreground"}`;
  const crumbSeparator = brand ? "text-white/40" : "text-border";
  // 紫の上に置くボタン: 枠線ボタンは白い半透明、主ボタンは白地に紫の文字
  const onBrandOutline = brand ? "bg-white/15 text-white hover:bg-white/25 hover:text-white" : "";
  const onBrandPrimary = brand ? "bg-white text-primary shadow-none hover:bg-white/90" : "";

  return (
    <div className="flex h-screen w-full bg-background">
      <ManualSidebar
        manuals={manuals}
        departments={departments}
        folders={folders}
        currentDepartment={currentDepartment}
        selectedId={view.type === "manual" ? view.id : undefined}
        selectedFolder={view.type === "folder" ? view.folder : undefined}
        query={query}
        onQueryChange={setQuery}
        onHome={() => go({ type: "home" })}
        onSelectDepartment={(d) => go({ type: "department", department: d })}
        onSelectFolder={(d, f) => go({ type: "folder", department: d, folder: f })}
        onSelectManual={(id) => go({ type: "manual", id })}
        onAddDepartment={addDepartment}
        onAddFolder={addFolder}
        onCreateManual={(d, f) => createManual(d, f)}
        onRenameFolder={renameFolder}
        onDeleteFolder={deleteFolder}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <header
          className={`flex h-12 shrink-0 items-center justify-between px-6 ${brand ? "bg-primary text-white" : ""}`}
        >
          <div className="flex items-center gap-1.5 text-sm">
            <button className={view.type === "home" ? crumbCurrent : crumbButton} onClick={() => go({ type: "home" })}>
              <Home className="size-3.5" />
              ホーム
            </button>
            {viewDepartment && (
              <>
                <span className={crumbSeparator}>/</span>
                {view.type === "department" ? (
                  <span className={crumbCurrent}>
                    <Building2 className="size-3.5" />
                    {viewDepartment}
                  </span>
                ) : (
                  <button className={crumbButton} onClick={() => go({ type: "department", department: viewDepartment })}>
                    <Building2 className="size-3.5" />
                    {viewDepartment}
                  </button>
                )}
              </>
            )}
            {view.type === "folder" && (
              <>
                <span className={crumbSeparator}>/</span>
                <span className={crumbCurrent}>
                  <Folder className="size-3.5" />
                  {view.folder}
                </span>
              </>
            )}
            {view.type === "manual" && selected && (
              <>
                <span className={crumbSeparator}>/</span>
                <button
                  className={crumbButton}
                  onClick={() => go({ type: "folder", department: selected.department, folder: selected.folder })}
                >
                  <Folder className="size-3.5" />
                  {selected.folder}
                </button>
                <span className={crumbSeparator}>/</span>
                <span className={crumbCurrent}>
                  <FileText className="size-3.5" />
                  <span className="max-w-[40ch] truncate">{selected.taskName}</span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {view.type === "manual" && selected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 ${onBrandOutline}`}
                  onClick={() => exportPdf(exportManualToPdf(selected))}
                >
                  <FileDown className="size-4" />
                  PDF出力
                </Button>
                <Button
                  size="sm"
                  className={`gap-2 ${onBrandPrimary}`}
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
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 ${onBrandOutline}`}
                  onClick={() => exportPdf(exportAllManualsToPdf(manuals))}
                >
                  <FileDown className="size-4" />
                  全てPDF出力
                </Button>
                {/* 課・フォルダのページには、同じ操作がページ内にある */}
                {view.type === "home" && (
                  <Button size="sm" className={`gap-2 ${onBrandPrimary}`} onClick={() => createManual()}>
                    <FilePlus className="size-4" />
                    新規マニュアル
                  </Button>
                )}
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {view.type === "home" && (
            <HomeView
              departments={departments}
              folders={folders}
              manuals={manuals}
              currentDepartment={currentDepartment}
              onSelectDepartment={(d) => go({ type: "department", department: d })}
              onAddDepartment={addDepartment}
              onRenameDepartment={renameDepartment}
              onDeleteDepartment={deleteDepartment}
              onOpenManual={(id) => go({ type: "manual", id })}
            />
          )}
          {view.type === "department" && (
            <DepartmentView
              key={view.department}
              department={view.department}
              folders={folders.filter((f) => f.department === view.department)}
              manuals={manuals.filter((m) => m.department === view.department)}
              onOpenFolder={(f) => go({ type: "folder", department: view.department, folder: f })}
              onOpenManual={(id) => go({ type: "manual", id })}
              onAddFolder={() => addFolder(view.department)}
              onRenameFolder={(o, n) => renameFolder(view.department, o, n)}
              onDeleteFolder={(n) => deleteFolder(view.department, n)}
              onCreateManual={() => createManual(view.department)}
              onRename={(n) => renameDepartment(view.department, n)}
            />
          )}
          {view.type === "folder" && (
            <FolderView
              department={view.department}
              folder={view.folder}
              manuals={manuals.filter((m) => m.department === view.department && m.folder === view.folder)}
              onBack={() => go({ type: "department", department: view.department })}
              onOpenManual={(id) => go({ type: "manual", id })}
              onCreateManual={() => createManual(view.department, view.folder)}
              onRename={(n) => renameFolder(view.department, view.folder, n)}
              onDelete={() => deleteFolder(view.department, view.folder)}
            />
          )}
          {view.type === "manual" && selected && (
            <ManualView
              key={selected.id}
              manual={selected}
              editing={editing}
              onChange={updateManual}
              onDelete={deleteManual}
              onBack={() => go({ type: "folder", department: selected.department, folder: selected.folder })}
              onTagClick={setQuery}
            />
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
