import regularFontUrl from "@expo-google-fonts/noto-sans-jp/400Regular/NotoSansJP_400Regular.ttf?url";
import boldFontUrl from "@expo-google-fonts/noto-sans-jp/700Bold/NotoSansJP_700Bold.ttf?url";
import { stripHtml } from "./text";
import type { AlertVariant, Block, Manual } from "./types";

// pdfmake の docDefinition は型定義を入れていないため、緩い型で扱う
type Content = Record<string, unknown>;

const COLOR = {
  primary: "#5B57C9",
  text: "#302F50",
  muted: "#77758B",
  border: "#E8E6EF",
  tableHeader: "#F1F0FA",
  quoteBackground: "#F4F2FC",
};

const ALERT_STYLES: Record<AlertVariant, { label: string; color: string; background: string }> = {
  info: { label: "情報", color: "#5B57C9", background: "#F1F0FA" },
  warning: { label: "注意", color: "#B7791F", background: "#FBF3E3" },
  danger: { label: "警告", color: "#C94F58", background: "#FBEBEC" },
  success: { label: "完了", color: "#32856A", background: "#E8F4EF" },
};

const sanitize = (s: string) => s.replace(/[\\/:*?"<>|]/g, "_").trim() || "manual";

// pdfkit が扱えるのは PNG / JPEG のみ。それ以外や外部URLの画像は代替テキストにする
const isEmbeddableImage = (src: string) => /^data:image\/(png|jpe?g);base64,/i.test(src);

const gridLayout = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => COLOR.border,
  vLineColor: () => COLOR.border,
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 5,
  paddingBottom: () => 5,
  fillColor: (rowIndex: number) => (rowIndex === 0 ? COLOR.tableHeader : null),
};

// 左に太い線を引いたボックス(注意書き・引用用)
const calloutLayout = (color: string, background: string) => ({
  hLineWidth: () => 0,
  vLineWidth: (i: number) => (i === 0 ? 3 : 0),
  vLineColor: () => color,
  paddingLeft: () => 10,
  paddingRight: () => 10,
  paddingTop: () => 8,
  paddingBottom: () => 8,
  fillColor: () => background,
});

function callout(content: Content[], color: string, background: string): Content {
  return {
    table: { widths: ["*"], body: [[{ stack: content }]] },
    layout: calloutLayout(color, background),
    margin: [0, 4, 0, 8],
  };
}

function blockToContent(block: Block): Content | null {
  switch (block.type) {
    case "text": {
      const text = stripHtml(block.html);
      return text ? { text, margin: [0, 0, 0, 8] } : null;
    }
    case "list": {
      const items = block.items.map((it) => stripHtml(it));
      return block.ordered
        ? { ol: items, margin: [0, 0, 0, 8] }
        : { ul: items, margin: [0, 0, 0, 8] };
    }
    case "table": {
      const cols = Math.max(0, ...block.rows.map((r) => r.length));
      if (cols === 0) return null;
      const body = block.rows.map((row, rowIndex) =>
        Array.from({ length: cols }, (_, c) => ({
          text: stripHtml(row[c] ?? ""),
          bold: rowIndex === 0,
        })),
      );
      return {
        table: { headerRows: 1, widths: Array(cols).fill("*"), body },
        layout: gridLayout,
        margin: [0, 0, 0, 10],
      };
    }
    case "alert": {
      const style = ALERT_STYLES[block.variant];
      return callout(
        [
          { text: style.label, bold: true, color: style.color, fontSize: 9, margin: [0, 0, 0, 2] },
          { text: stripHtml(block.html) },
        ],
        style.color,
        style.background,
      );
    }
    case "image": {
      const caption = block.caption ? { text: block.caption, color: COLOR.muted, fontSize: 9 } : null;
      if (isEmbeddableImage(block.src)) {
        return {
          stack: [{ image: block.src, fit: [480, 320] }, ...(caption ? [caption] : [])],
          margin: [0, 0, 0, 10],
        };
      }
      return { text: `(画像${block.caption ? `: ${block.caption}` : ""})`, color: COLOR.muted, margin: [0, 0, 0, 8] };
    }
    case "quote": {
      const text = stripHtml(block.html);
      return text ? callout([{ text, color: COLOR.muted }], COLOR.border, COLOR.quoteBackground) : null;
    }
  }
}

const blocksToContent = (blocks: Block[] | undefined): Content[] =>
  (blocks ?? []).map(blockToContent).filter((c): c is Content => c !== null);

function manualToContent(m: Manual, pageBreakBefore: boolean): Content[] {
  const content: Content[] = [];

  content.push({
    text: m.taskName,
    fontSize: 20,
    bold: true,
    color: COLOR.primary,
    margin: [0, 0, 0, 6],
    ...(pageBreakBefore ? { pageBreak: "before" } : {}),
  });
  content.push({
    canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: COLOR.primary }],
    margin: [0, 0, 0, 12],
  });

  const label = (text: string): Content => ({ text, bold: true, color: COLOR.muted, fontSize: 9 });
  content.push({
    table: {
      widths: [70, "*", 70, "*"],
      body: [
        [label("課"), m.department, label("フォルダ"), m.folder],
        [label("作成者"), m.author, label("最終改定日"), m.updatedAt],
        ...((m.tags ?? []).length > 0
          ? [[label("タグ"), { text: (m.tags ?? []).map((t) => `#${t}`).join("  "), colSpan: 3 }, {}, {}]]
          : []),
        [label("任務目的"), { text: m.purpose, colSpan: 3 }, {}, {}],
      ],
    },
    layout: { ...gridLayout, fillColor: () => null },
    margin: [0, 0, 0, 14],
  });

  m.sections.forEach((section, sIdx) => {
    content.push({
      text: `${sIdx + 1}. ${section.title}`,
      fontSize: 14,
      bold: true,
      margin: [0, 10, 0, 6],
    });
    content.push(...blocksToContent(section.blocks));

    section.items.forEach((item, iIdx) => {
      content.push({
        text: `${sIdx + 1}.${iIdx + 1} ${item.title}`,
        fontSize: 12,
        bold: true,
        margin: [0, 6, 0, 4],
      });
      content.push(...blocksToContent(item.blocks));

      (item.children ?? []).forEach((sub, subIdx) => {
        content.push({
          text: `${sIdx + 1}.${iIdx + 1}.${subIdx + 1} ${sub.title}`,
          fontSize: 11,
          bold: true,
          color: COLOR.muted,
          margin: [0, 4, 0, 4],
        });
        content.push(...blocksToContent(sub.blocks));
      });
    });
  });

  return content;
}

async function download(content: Content[], filename: string) {
  // pdfmake と日本語フォント(各約5.7MB)は重いので、出力ボタンを押したときだけ読み込む
  const mod = await import("pdfmake/build/pdfmake");
  const pdfMake = mod.default ?? mod;

  const absolute = (url: string) => new URL(url, window.location.href).href;
  const regular = absolute(regularFontUrl);
  const bold = absolute(boldFontUrl);

  pdfMake.setFonts({
    NotoSansJP: { normal: regular, bold, italics: regular, bolditalics: bold },
  });
  // 外部への取得はフォント(同一オリジン)に限定する
  pdfMake.setUrlAccessPolicy((url: string) => url.startsWith(window.location.origin));

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 50, 40, 50],
    defaultStyle: { font: "NotoSansJP", fontSize: 10, color: COLOR.text, lineHeight: 1.4 },
    content,
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: "テビキ", color: COLOR.primary, bold: true, fontSize: 8 },
        { text: `${currentPage} / ${pageCount}`, alignment: "right", color: COLOR.muted, fontSize: 8 },
      ],
      margin: [40, 0, 40, 0],
    }),
  };

  await pdfMake.createPdf(docDefinition).download(filename);
}

export function exportManualToPdf(m: Manual) {
  return download(manualToContent(m, false), `${sanitize(m.taskName)}.pdf`);
}

export function exportAllManualsToPdf(manuals: Manual[]) {
  const content = manuals.flatMap((m, i) => manualToContent(m, i > 0));
  return download(content, `テビキ_全マニュアル_${new Date().toISOString().slice(0, 10)}.pdf`);
}
