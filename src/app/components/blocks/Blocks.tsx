import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  List,
  ListOrdered,
  Plus,
  Quote,
  Table as TableIcon,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { useRef } from "react";
import type { AlertVariant, Block, BlockType } from "../../types";
import { RichEditor } from "../RichEditor";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";

const uid = () => Math.random().toString(36).slice(2, 9);

export function createBlock(type: BlockType): Block {
  switch (type) {
    case "text":
      return { id: uid(), type: "text", html: "" };
    case "list":
      return { id: uid(), type: "list", ordered: false, items: ["新しい項目"] };
    case "table":
      return {
        id: uid(),
        type: "table",
        rows: [
          ["見出し1", "見出し2", "見出し3"],
          ["", "", ""],
        ],
      };
    case "alert":
      return { id: uid(), type: "alert", variant: "info", html: "" };
    case "image":
      return { id: uid(), type: "image", src: "", caption: "" };
    case "quote":
      return { id: uid(), type: "quote", html: "" };
  }
}

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "text", label: "テキスト", icon: <Type className="size-4" />, description: "リッチテキストの段落" },
  { type: "list", label: "箇条書き", icon: <List className="size-4" />, description: "順序なし / 順序付きリスト" },
  { type: "table", label: "表", icon: <TableIcon className="size-4" />, description: "行・列の表" },
  { type: "alert", label: "警戒ブロック", icon: <AlertTriangle className="size-4" />, description: "情報・注意・警告など" },
  { type: "image", label: "画像", icon: <ImageIcon className="size-4" />, description: "画像のみのブロック" },
  { type: "quote", label: "引用", icon: <Quote className="size-4" />, description: "引用文" },
];

type Props = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  editing: boolean;
  compact?: boolean;
};

export function BlockList({ blocks: blocksProp, onChange, editing, compact }: Props) {
  const blocks: Block[] = Array.isArray(blocksProp) ? blocksProp : [];
  const update = (id: string, b: Block) => onChange(blocks.map((x) => (x.id === id ? b : x)));
  const remove = (id: string) => onChange(blocks.filter((x) => x.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const insertAt = (index: number, type: BlockType) => {
    const next = blocks.slice();
    next.splice(index, 0, createBlock(type));
    onChange(next);
  };

  if (!editing && blocks.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {blocks.length === 0 && editing && (
        <AddBlockMenu onAdd={(t) => insertAt(0, t)} variant="full" />
      )}
      {blocks.map((block, i) => (
        <div key={block.id} className="group/block relative">
          {editing && (
            <div className="absolute -left-11 top-0 w-11 pr-1 z-10 opacity-0 group-hover/block:opacity-100 hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <div className="flex flex-col gap-0.5 pt-1">
                <Button size="sm" variant="outline" className="size-7 p-0" onClick={() => move(block.id, -1)} disabled={i === 0}>
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="size-7 p-0" onClick={() => move(block.id, 1)} disabled={i === blocks.length - 1}>
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="size-7 p-0 text-rose-600 hover:text-rose-700"
                  onClick={() => remove(block.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
          <BlockRenderer block={block} editing={editing} onChange={(b) => update(block.id, b)} />
          {editing && <InlineAddButton onAdd={(t) => insertAt(i + 1, t)} />}
        </div>
      ))}
    </div>
  );
}

function BlockRenderer({
  block,
  editing,
  onChange,
}: {
  block: Block;
  editing: boolean;
  onChange: (b: Block) => void;
}) {
  switch (block.type) {
    case "text":
      return (
        <RichEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          editing={editing}
          placeholder="本文を入力（選択するとツールバーが表示されます）"
        />
      );
    case "list":
      return <ListBlockView block={block} editing={editing} onChange={onChange} />;
    case "table":
      return <TableBlockView block={block} editing={editing} onChange={onChange} />;
    case "alert":
      return <AlertBlockView block={block} editing={editing} onChange={onChange} />;
    case "image":
      return <ImageBlockView block={block} editing={editing} onChange={onChange} />;
    case "quote":
      return <QuoteBlockView block={block} editing={editing} onChange={onChange} />;
  }
}

/* ============== List ============== */
function ListBlockView({
  block,
  editing,
  onChange,
}: {
  block: Extract<Block, { type: "list" }>;
  editing: boolean;
  onChange: (b: Block) => void;
}) {
  const Tag = block.ordered ? "ol" : "ul";
  if (!editing) {
    return (
      <Tag className={cn("space-y-1 leading-relaxed", block.ordered ? "list-decimal pl-6" : "list-disc pl-6")}>
        {block.items.map((it, i) => (
          <li key={i} className="rich-content" dangerouslySetInnerHTML={{ __html: it }} />
        ))}
      </Tag>
    );
  }
  return (
    <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={!block.ordered ? "default" : "outline"}
          onClick={() => onChange({ ...block, ordered: false })}
          className="h-7 gap-1.5"
        >
          <List className="size-3.5" />
          箇条書き
        </Button>
        <Button
          size="sm"
          variant={block.ordered ? "default" : "outline"}
          onClick={() => onChange({ ...block, ordered: true })}
          className="h-7 gap-1.5"
        >
          <ListOrdered className="size-3.5" />
          番号付き
        </Button>
      </div>
      <div className="space-y-1.5">
        {block.items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-muted-foreground w-5 text-right text-sm">
              {block.ordered ? `${i + 1}.` : "•"}
            </span>
            <div className="flex-1 min-w-0 rounded bg-background">
              <RichEditor
                value={it}
                editing
                inline
                singleLine
                onChange={(html) =>
                  onChange({ ...block, items: block.items.map((x, idx) => (idx === i ? html : x)) })
                }
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="size-7 p-0"
              onClick={() => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5 h-7 text-muted-foreground"
        onClick={() => onChange({ ...block, items: [...block.items, ""] })}
      >
        <Plus className="size-3.5" />
        項目を追加
      </Button>
    </div>
  );
}

/* ============== Table ============== */
function TableBlockView({
  block,
  editing,
  onChange,
}: {
  block: Extract<Block, { type: "table" }>;
  editing: boolean;
  onChange: (b: Block) => void;
}) {
  const cols = Math.max(...block.rows.map((r) => r.length), 1);

  if (!editing) {
    return (
      <div className="overflow-x-auto rounded-lg shadow-sm bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {block.rows[0]?.map((c, i) => (
                <th
                  key={i}
                  className="text-left px-3 py-2 border-b font-medium rich-content"
                  dangerouslySetInnerHTML={{ __html: c }}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.slice(1).map((row, ri) => (
              <tr key={ri} className="border-b last:border-0">
                {row.map((c, i) => (
                  <td
                    key={i}
                    className="px-3 py-2 rich-content"
                    dangerouslySetInnerHTML={{ __html: c }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const setCell = (ri: number, ci: number, v: string) => {
    onChange({
      ...block,
      rows: block.rows.map((row, i) => (i === ri ? row.map((c, j) => (j === ci ? v : c)) : row)),
    });
  };

  return (
    <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri} className={ri === 0 ? "bg-muted/60" : ""}>
                {Array.from({ length: cols }).map((_, ci) => (
                  <td key={ci} className={cn("border p-0.5 align-top", ri === 0 && "bg-muted/60")}>
                    <RichEditor
                      value={row[ci] ?? ""}
                      editing
                      inline
                      singleLine
                      onChange={(html) => setCell(ri, ci, html)}
                      placeholder={ri === 0 ? `見出し${ci + 1}` : ""}
                      className={cn(ri === 0 && "font-medium")}
                    />
                  </td>
                ))}
                <td className="w-8">
                  {ri > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-7 p-0"
                      onClick={() => onChange({ ...block, rows: block.rows.filter((_, i) => i !== ri) })}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5"
          onClick={() =>
            onChange({ ...block, rows: [...block.rows, Array.from({ length: cols }, () => "")] })
          }
        >
          <Plus className="size-3.5" />
          行を追加
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5"
          onClick={() => onChange({ ...block, rows: block.rows.map((r) => [...r, ""]) })}
        >
          <Plus className="size-3.5" />
          列を追加
        </Button>
        {cols > 1 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-muted-foreground"
            onClick={() => onChange({ ...block, rows: block.rows.map((r) => r.slice(0, -1)) })}
          >
            <X className="size-3.5" />
            列を削除
          </Button>
        )}
      </div>
    </div>
  );
}

/* ============== Alert ============== */
const ALERT_STYLES: Record<AlertVariant, { wrap: string; icon: React.ReactNode; label: string }> = {
  info: {
    wrap: "border-primary bg-primary/10 text-foreground",
    icon: <Info className="size-5 text-primary" />,
    label: "情報",
  },
  warning: {
    wrap: "border-amber-400 bg-amber-50 text-amber-900",
    icon: <AlertTriangle className="size-5 text-amber-600" />,
    label: "注意",
  },
  danger: {
    wrap: "border-rose-500 bg-rose-50 text-rose-900",
    icon: <AlertCircle className="size-5 text-rose-600" />,
    label: "警告",
  },
  success: {
    wrap: "border-emerald-500 bg-emerald-50 text-emerald-900",
    icon: <CheckCircle2 className="size-5 text-emerald-600" />,
    label: "成功",
  },
};

function AlertBlockView({
  block,
  editing,
  onChange,
}: {
  block: Extract<Block, { type: "alert" }>;
  editing: boolean;
  onChange: (b: Block) => void;
}) {
  const style = ALERT_STYLES[block.variant];
  return (
    <div className={cn("rounded-lg border-l-4 p-4 flex gap-3", style.wrap)}>
      <div className="shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1 min-w-0">
        {editing && (
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            {(Object.keys(ALERT_STYLES) as AlertVariant[]).map((v) => (
              <Button
                key={v}
                size="sm"
                variant={block.variant === v ? "default" : "outline"}
                onClick={() => onChange({ ...block, variant: v })}
                className="h-7"
              >
                {ALERT_STYLES[v].label}
              </Button>
            ))}
          </div>
        )}
        <RichEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          editing={editing}
          placeholder="警戒メッセージを入力"
        />
      </div>
    </div>
  );
}

/* ============== Image ============== */
function ImageBlockView({
  block,
  editing,
  onChange,
}: {
  block: Extract<Block, { type: "image" }>;
  editing: boolean;
  onChange: (b: Block) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange({ ...block, src: reader.result as string });
    reader.readAsDataURL(file);
  };

  if (!editing) {
    if (!block.src) return null;
    return (
      <figure className="space-y-1.5">
        <img src={block.src} alt={block.caption} className="rounded-lg shadow-sm max-w-full" />
        {block.caption && (
          <figcaption className="text-sm text-muted-foreground text-center">{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
      {block.src ? (
        <div className="relative">
          <img src={block.src} alt={block.caption} className="rounded-md shadow-sm max-w-full" />
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={() => onChange({ ...block, src: "" })}
          >
            画像を変更
          </Button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-md bg-primary/5 hover:bg-primary/10 py-10 flex flex-col items-center gap-2 text-primary transition-colors"
        >
          <ImageIcon className="size-8" />
          <span className="text-sm">クリックして画像をアップロード</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <Input
        value={block.caption}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="キャプション(任意)"
        className="h-8"
      />
    </div>
  );
}

/* ============== Quote ============== */
function QuoteBlockView({
  block,
  editing,
  onChange,
}: {
  block: Extract<Block, { type: "quote" }>;
  editing: boolean;
  onChange: (b: Block) => void;
}) {
  return (
    <blockquote className="flex gap-3 border-l-4 border-primary bg-secondary/70 pl-4 pr-3 py-3 rounded-r-md italic">
      <Quote className="size-5 shrink-0 text-primary mt-0.5" />
      <div className="flex-1 min-w-0">
        <RichEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          editing={editing}
          placeholder="引用文を入力"
        />
      </div>
    </blockquote>
  );
}

/* ============== Add Block UI ============== */
export function AddBlockMenu({
  onAdd,
  variant = "compact",
}: {
  onAdd: (t: BlockType) => void;
  variant?: "compact" | "full";
}) {
  if (variant === "full") {
    return (
      <div className="rounded-lg bg-primary/5 p-4">
        <div className="text-sm text-muted-foreground mb-2">ブロックを追加</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onAdd(opt.type)}
              className="flex items-start gap-2 rounded-md bg-card shadow-sm p-2.5 text-left hover:bg-primary/10 transition-colors"
            >
              <span className="text-primary mt-0.5">{opt.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground truncate">{opt.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-muted-foreground hover:text-primary">
          <Plus className="size-3.5" />
          ブロックを追加
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {BLOCK_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.type} onClick={() => onAdd(opt.type)} className="gap-2">
            <span className="text-primary">{opt.icon}</span>
            <div>
              <div className="text-sm">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InlineAddButton({ onAdd }: { onAdd: (t: BlockType) => void }) {
  return (
    <div className="h-0 relative opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover/block:opacity-100 transition-opacity">
      <div className="absolute left-0 right-0 -top-1 flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground hover:text-primary shadow-sm">
              <Plus className="size-3" />
              追加
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {BLOCK_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt.type} onClick={() => onAdd(opt.type)} className="gap-2">
                <span className="text-primary">{opt.icon}</span>
                <span className="text-sm">{opt.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
