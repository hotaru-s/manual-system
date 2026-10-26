import { useEffect, useRef } from "react";
import { cn } from "./ui/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  /** onBrand: 紫の帯の上に置くとき(編集中の背景や枠を白系にする) */
  tone?: "default" | "onBrand";
};

const EDITING_TONES = {
  default: "bg-primary/5 hover:bg-primary/10 focus:bg-background focus:ring-2 focus:ring-primary",
  onBrand: "bg-white/10 hover:bg-white/15 focus:bg-white/20 focus:ring-2 focus:ring-white/70",
};

export function EditableText({ value, onChange, editing, multiline, placeholder, className, tone = "default" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value, editing]);

  if (!editing) {
    return (
      <div className={cn(multiline ? "whitespace-pre-wrap" : "", className)}>
        {value || <span className={tone === "onBrand" ? "text-white/70" : "text-muted-foreground"}>{placeholder}</span>}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerText)}
      className={cn(
        "outline-none rounded px-1.5 py-0.5 -mx-1.5 -my-0.5",
        EDITING_TONES[tone],
        multiline ? "whitespace-pre-wrap min-h-[1.5em]" : "",
        className,
      )}
      data-placeholder={placeholder}
    />
  );
}
