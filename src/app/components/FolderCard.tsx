import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  count: number;
  onOpen: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
};

// ホバー時だけ、ごく淡い紫になる。タブと本体は重なるため、半透明ではなく不透明の色で塗る
const FILL = "bg-card group-hover:bg-[color-mix(in_oklab,var(--card),var(--primary)_6%)]";

// 上部に小さなタブが付いた、白いフォルダ。影は付けない
export function FolderCard({ name, count, onOpen, onRename, onDelete }: Props) {
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
      className="group relative h-36 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className={cn("absolute left-0 top-0 h-6 w-[38%] rounded-t-2xl transition-colors", FILL)} />
      <div className={cn("absolute inset-x-0 bottom-0 top-4 rounded-2xl rounded-tl-none transition-colors", FILL)} />

      <div className="absolute inset-x-5 bottom-4 top-9 flex flex-col justify-between text-foreground">
        <div>
          <div className="text-[10px] tracking-[0.14em] text-muted-foreground">MANUALS</div>
          <div className="mt-0.5 text-sm font-medium">{count} 件</div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.14em] text-muted-foreground">FOLDER</div>
          <div className="mt-0.5 truncate font-bold tracking-tight">{name}</div>
        </div>
      </div>

      <div className="absolute right-3 top-8" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="size-7 rounded-full inline-flex items-center justify-center text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100"
              aria-label={`フォルダ「${name}」のメニュー`}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              className="gap-2"
              onClick={() => {
                const v = prompt("新しいフォルダ名", name);
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
  );
}
