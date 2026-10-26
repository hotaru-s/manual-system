import { Plus, Tag, X } from "lucide-react";
import { useState } from "react";

type Props = {
  tags: string[];
  editing: boolean;
  onChange: (tags: string[]) => void;
  /** 閲覧中にタグを押したときの動作(検索など)。未指定なら押せない */
  onTagClick?: (tag: string) => void;
  /** onBrand: 紫の帯の上に置くとき(白い半透明のタグ) */
  tone?: "default" | "onBrand";
};

const DELIMITER = /[,，、]/;

const TONES = {
  default: {
    chip: "bg-primary/10 text-primary",
    hover: "hover:bg-primary/20",
    add: "bg-secondary text-muted-foreground focus-within:ring-primary",
    placeholder: "placeholder:text-muted-foreground",
  },
  onBrand: {
    chip: "bg-white/15 text-white",
    hover: "hover:bg-white/25",
    add: "bg-white/15 text-white focus-within:ring-white",
    placeholder: "placeholder:text-white/70",
  },
};

export function TagList({ tags, editing, onChange, onTagClick, tone = "default" }: Props) {
  const [draft, setDraft] = useState("");
  const t = TONES[tone];
  const chip = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${t.chip}`;

  // カンマ(半角・全角)や読点で区切って複数まとめて追加でき、重複と先頭の # は取り除く
  const add = (parts: string[]) => {
    const added = parts
      .map((p) => p.trim().replace(/^[#＃]+/, ""))
      .filter((p) => p && !tags.includes(p));
    if (added.length > 0) onChange([...tags, ...Array.from(new Set(added))]);
  };
  const commit = (raw: string) => {
    add(raw.split(DELIMITER));
    setDraft("");
  };

  if (!editing) {
    if (tags.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) =>
          onTagClick ? (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`${chip} ${t.hover} transition-colors`}
              title={`「${tag}」で検索`}
            >
              <Tag className="size-3" />
              {tag}
            </button>
          ) : (
            <span key={tag} className={chip}>
              <Tag className="size-3" />
              {tag}
            </span>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className={chip}>
          <Tag className="size-3" />
          {tag}
          <button
            onClick={() => onChange(tags.filter((x) => x !== tag))}
            className={`-mr-1 ml-0.5 inline-flex size-4 items-center justify-center rounded-full ${t.hover}`}
            title={`「${tag}」を削除`}
            aria-label={`「${tag}」を削除`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <label className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs focus-within:ring-2 ${t.add}`}>
        <Plus className="size-3" />
        <input
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            // 区切り文字が入った時点で、その手前までを確定する(変換中は除く。貼り付けにも対応)
            if (!(e.nativeEvent as InputEvent).isComposing && DELIMITER.test(v)) {
              const parts = v.split(DELIMITER);
              const rest = parts.pop() ?? "";
              add(parts);
              setDraft(rest);
            } else setDraft(v);
          }}
          onKeyDown={(e) => {
            // 日本語入力の変換確定のEnterでは追加しない
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
            } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => commit(draft)}
          placeholder="タグを追加(Enterで確定)"
          className={`w-40 bg-transparent text-xs outline-none ${t.placeholder}`}
        />
      </label>
    </div>
  );
}
