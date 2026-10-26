export type AlertVariant = "info" | "warning" | "danger" | "success";

export type Block =
  | { id: string; type: "text"; html: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "table"; rows: string[][] } // rows[0] = header
  | { id: string; type: "alert"; variant: AlertVariant; html: string }
  | { id: string; type: "image"; src: string; caption: string }
  | { id: string; type: "quote"; html: string };

export type BlockType = Block["type"];

export type SubItem = {
  id: string;
  title: string;
  blocks: Block[];
};

export type Item = {
  id: string;
  title: string;
  blocks: Block[];
  children: SubItem[];
};

export type Section = {
  id: string;
  title: string;
  blocks?: Block[];
  items: Item[];
};

// 階層は「課 → フォルダ → マニュアル」。フォルダは課の中にだけあり、入れ子にはしない
export type Folder = {
  department: string;
  name: string;
};

export type Manual = {
  id: string;
  department: string;
  folder: string;
  tags?: string[];
  author: string;
  taskName: string;
  updatedAt: string;
  purpose: string;
  sections: Section[];
};
