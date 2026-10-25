import { useEffect, useRef } from "react";
import { cn } from "./ui/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
};

export function EditableText({ value, onChange, editing, multiline, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value, editing]);

  if (!editing) {
    return (
      <div className={cn(multiline ? "whitespace-pre-wrap" : "", className)}>
        {value || <span className="text-muted-foreground">{placeholder}</span>}
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
        "outline-none rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 ring-1 ring-dashed ring-border focus:ring-primary focus:ring-2 focus:ring-solid bg-background/40",
        multiline ? "whitespace-pre-wrap min-h-[1.5em]" : "",
        className,
      )}
      data-placeholder={placeholder}
    />
  );
}
