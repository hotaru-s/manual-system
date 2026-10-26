import { ChevronLeft, FilePlus, Pencil, Trash2 } from "lucide-react";
import type { Manual } from "../types";
import { ManualRow } from "./ManualRow";
import { Button } from "./ui/button";

type Props = {
  department: string;
  folder: string;
  manuals: Manual[];
  onBack: () => void;
  onOpenManual: (id: string) => void;
  onCreateManual: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
};

export function FolderView({ department, folder, manuals, onBack, onOpenManual, onCreateManual, onRename, onDelete }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 gap-1 text-muted-foreground hover:text-foreground"
        onClick={onBack}
      >
        <ChevronLeft className="size-4" />
        {department}
      </Button>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.14em] text-muted-foreground">FOLDER</div>
          <h1 className="flex items-center gap-2 tracking-tight">
            <span className="truncate">{folder}</span>
            <button
              onClick={() => {
                const v = prompt("新しいフォルダ名", folder);
                if (v) onRename(v);
              }}
              className="size-7 shrink-0 rounded-full inline-flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="フォルダ名を変更"
              aria-label="フォルダ名を変更"
            >
              <Pencil className="size-3.5" />
            </button>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{manuals.length} 件のマニュアル</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="gap-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            フォルダを削除
          </Button>
          <Button className="gap-1.5" onClick={onCreateManual}>
            <FilePlus className="size-4" />
            新規マニュアル
          </Button>
        </div>
      </div>

      {manuals.length === 0 ? (
        <button
          onClick={onCreateManual}
          className="w-full rounded-2xl bg-card py-14 text-primary shadow-card transition-shadow hover:shadow-card-hover"
        >
          <FilePlus className="mx-auto mb-2 size-8" />
          このフォルダに最初のマニュアルを追加
        </button>
      ) : (
        <div className="space-y-2">
          {manuals.map((m) => (
            <ManualRow key={m.id} manual={m} onOpen={() => onOpenManual(m.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
