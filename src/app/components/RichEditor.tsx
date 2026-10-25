import { Bold, Italic, Underline } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  placeholder?: string;
  className?: string;
  inline?: boolean;
  singleLine?: boolean;
};

const COLORS = [
  "#0f172a",
  "#dc2626",
  "#ea580c",
  "#f59e0b",
  "#16a34a",
  "#0284c7",
  "#7c3aed",
  "#db2777",
  "#6b7280",
];

export function RichEditor({
  value,
  onChange,
  editing,
  placeholder,
  className,
  inline,
  singleLine,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const savedRange = useRef<Range | null>(null);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value, editing]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const updateToolbar = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !ref.current) {
      return;
    }
    if (!ref.current.contains(sel.anchorNode)) return;
    saveSelection();
    if (sel.isCollapsed) {
      setToolbarPos(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    setToolbarPos({
      top: Math.max(8, rect.top - 44),
      left: rect.left + rect.width / 2,
    });
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    } else {
      ref.current?.focus();
    }
  };

  const exec = (command: string, val?: string) => {
    ref.current?.focus();
    restoreSelection();
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {}
    document.execCommand(command, false, val);
    if (ref.current) onChange(ref.current.innerHTML);
    saveSelection();
    updateToolbar();
  };

  useEffect(() => {
    if (!editing) return;
    const handler = () => {
      if (!focusedRef.current) return;
      updateToolbar();
    };
    document.addEventListener("selectionchange", handler);
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      document.removeEventListener("selectionchange", handler);
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [editing]);

  if (!editing) {
    return value ? (
      <div
        className={cn("rich-content leading-relaxed", className)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    ) : (
      <div className={cn("text-muted-foreground", className)}>{placeholder}</div>
    );
  }

  const toolbar =
    toolbarPos &&
    createPortal(
      <div
        style={{
          position: "fixed",
          top: toolbarPos.top,
          left: toolbarPos.left,
          transform: "translateX(-50%)",
          zIndex: 60,
        }}
        className="rich-toolbar-keep flex items-center gap-0.5 rounded-md border bg-background shadow-md p-1 w-fit"
        onMouseDown={(e) => e.preventDefault()}
      >
        <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => exec("bold")}>
          <Bold className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => exec("italic")}>
          <Italic className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => exec("underline")}>
          <Underline className="size-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <div className="flex items-center gap-1 px-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("foreColor", c)}
              className="size-5 rounded-full border border-border/60 hover:scale-110 transition-transform"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      {toolbar}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => {
          focusedRef.current = true;
          updateToolbar();
        }}
        onInput={(e) => {
          onChange(e.currentTarget.innerHTML);
          updateToolbar();
        }}
        onBlur={(e) => {
          focusedRef.current = false;
          saveSelection();
          onChange(e.currentTarget.innerHTML);
          setTimeout(() => {
            const active = document.activeElement;
            if (!active?.closest(".rich-toolbar-keep")) {
              setToolbarPos(null);
            }
          }, 150);
        }}
        onKeyDown={(e) => {
          if (singleLine && e.key === "Enter") {
            e.preventDefault();
          }
        }}
        onKeyUp={() => {
          saveSelection();
          updateToolbar();
        }}
        onMouseUp={() => {
          saveSelection();
          updateToolbar();
        }}
        className={cn(
          "rich-content outline-none leading-relaxed",
          inline
            ? "px-1.5 py-1 rounded min-h-[1.75rem] focus:bg-muted/40"
            : "rounded px-2 py-1.5 ring-1 ring-dashed ring-border focus:ring-primary focus:ring-2 bg-background/40 min-h-[2.5em]",
          className,
        )}
        data-placeholder={placeholder}
      />
    </>
  );
}
