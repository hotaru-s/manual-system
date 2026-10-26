import { CalendarDays, ChevronRight, FileText, Folder, User } from "lucide-react";
import type { Manual } from "../types";
import { TagList } from "./TagList";

type Props = {
  manual: Manual;
  onOpen: () => void;
  /** 「課 / フォルダ」を表示する(一覧の絞り込みがない画面で使う) */
  showPath?: boolean;
  /** 「新着」の目印(コーラルの小さなラベル) */
  isNew?: boolean;
};

export function ManualRow({ manual: m, onOpen, showPath, isNew }: Props) {
  return (
    <button
      onClick={onOpen}
      // 通常時は背景も影もなし。ホバーしたときだけ白い背景と影が付く
      className="group w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-[background-color,box-shadow] hover:bg-card hover:shadow-card"
    >
      <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <FileText className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-medium">
          {isNew && (
            <span className="shrink-0 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-coral-foreground">
              新着
            </span>
          )}
          <span className="truncate">{m.taskName}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {showPath && (
            <span className="inline-flex items-center gap-1">
              <Folder className="size-3.5" />
              {m.department} / {m.folder}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" />
            {m.author}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {m.updatedAt}
          </span>
        </div>
        {(m.tags ?? []).length > 0 && (
          <div className="mt-2">
            <TagList tags={m.tags ?? []} editing={false} onChange={() => {}} />
          </div>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
