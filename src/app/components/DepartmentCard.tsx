import { Building2, Folder, MoreHorizontal, Pencil, FileText, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

type Props = {
  name: string;
  folderCount: number;
  manualCount: number;
  /** いま選んでいる課。紫のべた塗りで示す */
  current?: boolean;
  onOpen: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
};

export function DepartmentCard({ name, folderCount, manualCount, current, onOpen, onRename, onDelete }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group relative rounded-2xl p-5 outline-none transition-[box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:shadow-card-hover",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        current ? "bg-primary text-primary-foreground shadow-card-hover" : "bg-card text-foreground shadow-card",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center",
            current ? "bg-white/20 text-white" : "bg-primary/10 text-primary",
          )}
        >
          <Building2 className="size-5" />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "size-7 rounded-full inline-flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100",
                  current ? "text-white hover:bg-white/20" : "text-muted-foreground hover:bg-secondary",
                )}
                aria-label={`課「${name}」のメニュー`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  const v = prompt("新しい課の名前", name);
                  if (v) onRename(v);
                }}
              >
                <Pencil className="size-3.5" />
                名前を変更
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-rose-600 focus:text-rose-700">
                <Trash2 className="size-3.5" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6">
        <div className={cn("text-[10px] tracking-[0.14em]", current ? "text-white/70" : "text-muted-foreground")}>
          DEPARTMENT
        </div>
        <div className="mt-0.5 truncate font-bold tracking-tight">{name}</div>
        <div className={cn("mt-2 flex items-center gap-3 text-xs", current ? "text-white/80" : "text-muted-foreground")}>
          <span className="inline-flex items-center gap-1">
            <Folder className="size-3.5" />
            {folderCount} フォルダ
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="size-3.5" />
            {manualCount} マニュアル
          </span>
        </div>
      </div>
    </div>
  );
}
