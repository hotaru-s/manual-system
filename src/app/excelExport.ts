import * as XLSX from "xlsx";
import type { Block, Manual } from "./types";

const stripHtml = (html: string) =>
  String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

function blockToCells(block: Block): { kind: string; content: string } {
  switch (block.type) {
    case "text":
      return { kind: "テキスト", content: stripHtml(block.html) };
    case "list":
      return {
        kind: block.ordered ? "番号付き" : "箇条書き",
        content: block.items
          .map((it, i) => `${block.ordered ? `${i + 1}.` : "・"} ${stripHtml(it)}`)
          .join("\n"),
      };
    case "table":
      return {
        kind: "表",
        content: block.rows.map((r) => r.map((c) => stripHtml(c)).join(" | ")).join("\n"),
      };
    case "alert":
      return { kind: `警戒(${block.variant})`, content: stripHtml(block.html) };
    case "image":
      return { kind: "画像", content: block.caption || "(画像)" };
    case "quote":
      return { kind: "引用", content: stripHtml(block.html) };
  }
}

type Row = (string | number)[];

function manualToRows(m: Manual): Row[] {
  const rows: Row[] = [];
  rows.push([m.taskName, "", "", ""]);
  rows.push(["カテゴリー", m.category, "ジャンル", m.genre]);
  rows.push(["作成者", m.author, "最終改定日", m.updatedAt]);
  rows.push(["任務目的", m.purpose, "", ""]);
  rows.push(["", "", "", ""]);
  rows.push(["セクション", "項目", "種類", "内容"]);

  m.sections.forEach((section, sIdx) => {
    const sLabel = `${sIdx + 1}. ${section.title}`;
    (section.blocks ?? []).forEach((b) => {
      const { kind, content } = blockToCells(b);
      rows.push([sLabel, "(セクション直下)", kind, content]);
    });
    section.items.forEach((item, iIdx) => {
      const iLabel = `${sIdx + 1}.${iIdx + 1} ${item.title}`;
      const blocks = item.blocks ?? [];
      if (blocks.length === 0) {
        rows.push([sLabel, iLabel, "", ""]);
      }
      blocks.forEach((b) => {
        const { kind, content } = blockToCells(b);
        rows.push([sLabel, iLabel, kind, content]);
      });
      (item.children ?? []).forEach((sub, subIdx) => {
        const subLabel = `${iLabel} ▸ ${sIdx + 1}.${iIdx + 1}.${subIdx + 1} ${sub.title}`;
        const subBlocks = sub.blocks ?? [];
        if (subBlocks.length === 0) {
          rows.push([sLabel, subLabel, "", ""]);
        }
        subBlocks.forEach((b) => {
          const { kind, content } = blockToCells(b);
          rows.push([sLabel, subLabel, kind, content]);
        });
      });
    });
  });

  return rows;
}

function buildSheet(rows: Row[]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 28 }, { wch: 36 }, { wch: 14 }, { wch: 60 }];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 3, c: 1 }, e: { r: 3, c: 3 } },
  ];
  return ws;
}

const sanitize = (s: string) => s.replace(/[\\/:*?"<>|]/g, "_").trim() || "manual";

const sheetName = (s: string) => {
  const cleaned = s.replace(/[\\/?*[\]:]/g, "_").slice(0, 31);
  return cleaned || "Sheet";
};

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function writeWorkbook(wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, filename);
}

export function exportManualToExcel(m: Manual) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet(manualToRows(m)), sheetName(m.taskName));
  writeWorkbook(wb, `${sanitize(m.taskName)}.xlsx`);
}

export function exportAllManualsToExcel(manuals: Manual[]) {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  manuals.forEach((m, i) => {
    let name = sheetName(m.taskName) || `Sheet${i + 1}`;
    let n = 2;
    while (used.has(name)) {
      name = `${sheetName(m.taskName).slice(0, 28)}_${n++}`;
    }
    used.add(name);
    XLSX.utils.book_append_sheet(wb, buildSheet(manualToRows(m)), name);
  });
  writeWorkbook(wb, `業務マニュアル_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
