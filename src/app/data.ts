import type { Manual } from "./types";

export const initialManuals: Manual[] = [
  {
    id: "m1",
    category: "デザイン課",
    genre: "基本情報",
    author: "苗字",
    taskName: "社名について",
    updatedAt: "2025/7/25",
    purpose: "社名について把握し、企業ブランディングへの理解を深める。",
    sections: [
      {
        id: "s1",
        title: "社名の由来と歴史",
        items: [
          {
            id: "i1",
            title: "創業時の想い",
            blocks: [
              {
                id: "b1",
                type: "text",
                html: "<p>創業者が掲げた理念に基づき、社名には<b>「未来を創る」</b>という意味が込められています。1985年の創業以来、この理念は変わっていません。</p>",
              },
              {
                id: "b2",
                type: "alert",
                variant: "warning",
                html: "<p>社外資料に社名の由来を記載する際は、必ず広報部の確認を取ってください。</p>",
              },
            ],
            children: [
              {
                id: "c1",
                title: "理念の3本柱",
                blocks: [
                  {
                    id: "b3",
                    type: "list",
                    ordered: false,
                    items: ["誠実 — 約束を守る", "革新 — 新しい挑戦を恐れない", "共創 — 仲間と共に価値を生む"],
                  },
                ],
              },
            ],
          },
          {
            id: "i2",
            title: "ロゴデザインの意味",
            blocks: [
              {
                id: "b4",
                type: "text",
                html: "<p>ロゴの3本のラインは「人」「技術」「信頼」を表しており、これらが交わることで新しい価値を生み出すことを表現しています。</p>",
              },
              {
                id: "b5",
                type: "table",
                rows: [
                  ["要素", "意味", "色"],
                  ["上部ライン", "人", "オレンジ"],
                  ["中央ライン", "技術", "ダークグレー"],
                  ["下部ライン", "信頼", "ブラック"],
                ],
              },
            ],
            children: [],
          },
        ],
      },
      {
        id: "s2",
        title: "ブランドガイドライン",
        items: [
          {
            id: "i3",
            title: "コーポレートカラー",
            blocks: [
              {
                id: "b6",
                type: "text",
                html: '<p>メインカラーは <span style="color: rgb(249, 115, 22)"><b>コーポレートオレンジ(#F97316)</b></span>。アクセントとしてダークグレーを使用します。</p>',
              },
              {
                id: "b7",
                type: "alert",
                variant: "danger",
                html: "<p>カラーコードを変更してはいけません。資料は必ずブランドガイドの最新版を参照してください。</p>",
              },
            ],
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "m2",
    category: "デザイン課",
    genre: "業務フロー",
    author: "山田",
    taskName: "デザイン依頼の受付",
    updatedAt: "2025/8/10",
    purpose: "デザイン依頼を受付ける際の標準フローを習得する。",
    sections: [
      {
        id: "s1",
        title: "依頼の受付方法",
        items: [
          {
            id: "i1",
            title: "依頼フォームの確認",
            blocks: [
              {
                id: "b1",
                type: "list",
                ordered: true,
                items: ["毎朝9:00に社内ポータルを確認", "新規依頼を担当者へ振り分け", "24時間以内に一次回答"],
              },
              {
                id: "b2",
                type: "alert",
                variant: "info",
                html: "<p>急ぎの依頼はチャットで通知される場合があります。</p>",
              },
            ],
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "m3",
    category: "営業課",
    genre: "基本情報",
    author: "鈴木",
    taskName: "見積書の作成",
    updatedAt: "2025/9/3",
    purpose: "見積書を正確かつ迅速に作成できるようになる。",
    sections: [
      {
        id: "s1",
        title: "テンプレートの選定",
        items: [
          {
            id: "i1",
            title: "案件タイプの判別",
            blocks: [
              {
                id: "b1",
                type: "table",
                rows: [
                  ["案件タイプ", "テンプレート", "承認者"],
                  ["新規", "estimate_new.xlsx", "営業部長"],
                  ["継続", "estimate_renew.xlsx", "課長"],
                  ["スポット", "estimate_spot.xlsx", "課長"],
                ],
              },
            ],
            children: [],
          },
        ],
      },
    ],
  },
];
