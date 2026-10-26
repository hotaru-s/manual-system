import { Building2, Clock, Plus } from "lucide-react";
import { useMemo } from "react";
import { sortRecent } from "../manualUtils";
import type { Folder, Manual } from "../types";
import { DepartmentCard } from "./DepartmentCard";
import { ManualRow } from "./ManualRow";
import { Button } from "./ui/button";

type Props = {
  departments: string[];
  folders: Folder[];
  manuals: Manual[];
  currentDepartment?: string;
  onSelectDepartment: (department: string) => void;
  onAddDepartment: () => void;
  onRenameDepartment: (oldName: string, newName: string) => void;
  onDeleteDepartment: (name: string) => void;
  onOpenManual: (id: string) => void;
};

export function HomeView({
  departments,
  folders,
  manuals,
  currentDepartment,
  onSelectDepartment,
  onAddDepartment,
  onRenameDepartment,
  onDeleteDepartment,
  onOpenManual,
}: Props) {
  const recent = useMemo(() => sortRecent(manuals, 5), [manuals]);

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.14em] text-muted-foreground">HOME</div>
          <h1 className="tracking-tight">課を選ぶ</h1>
          <p className="mt-1 text-sm text-muted-foreground">課を選ぶと、その課のフォルダとマニュアルが表示されます。</p>
        </div>
        <Button className="gap-1.5" onClick={onAddDepartment}>
          <Plus className="size-4" />
          課を追加
        </Button>
      </div>

      {departments.length === 0 ? (
        <button
          onClick={onAddDepartment}
          className="w-full rounded-2xl bg-card py-14 text-primary shadow-card transition-shadow hover:shadow-card-hover"
        >
          <Building2 className="mx-auto mb-2 size-8" />
          最初の課を追加する
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <DepartmentCard
              key={d}
              name={d}
              folderCount={folders.filter((f) => f.department === d).length}
              manualCount={manuals.filter((m) => m.department === d).length}
              current={d === currentDepartment}
              onOpen={() => onSelectDepartment(d)}
              onRename={(v) => onRenameDepartment(d, v)}
              onDelete={() => onDeleteDepartment(d)}
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
              <ManualRow key={m.id} manual={m} showPath isNew={i === 0} onOpen={() => onOpenManual(m.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
