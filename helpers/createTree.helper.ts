import { Types } from "mongoose";

type IdLike = string | Types.ObjectId;

export interface CategoryNode {
  _id: string;              // OUTPUT luôn là string
  parent_id?: string;       // "" hoặc string id cha
  position?: number;
  title?: string;
  thumbnail?: string;
  status?: string;
  children?: CategoryNode[];
  // ... các field khác nếu cần
}

// Kiểu input nhận từ .lean()
export type CategoryInput = {
  _id: IdLike;
  parent_id?: IdLike | "";
  position?: number | string;
  title?: string;
  thumbnail?: string;
  status?: string;
  [k: string]: any;
};

type SortDir = 1 | -1;

export function buildCategoryTree(
  docs: CategoryInput[],
  opts: { sortBy?: keyof CategoryNode; dir?: SortDir } = { sortBy: "position", dir: 1 }
): CategoryNode[] {
  const sortBy = opts.sortBy ?? "position";
  const dir: SortDir = opts.dir ?? 1;

  const map = new Map<string, CategoryNode>();

  for (const d of docs) {
    const id = String(d._id ?? "");
    if (!id) continue;

    const node: CategoryNode = {
      _id: id,
      parent_id: d.parent_id ? String(d.parent_id) : "",
      position:
        typeof d.position === "number"
          ? d.position
          : Number(d.position ?? 0),
      title: d.title,
      thumbnail: d.thumbnail,
      status: d.status,
      children: [],
    };

    // giữ lại các field khác nếu muốn
    for (const k in d) {
      if (!(k in node)) (node as any)[k] = (d as any)[k];
    }

    map.set(id, node);
  }

  const roots: CategoryNode[] = [];
  for (const node of map.values()) {
    const pid = node.parent_id || "";
    if (pid && map.has(pid)) {
      map.get(pid)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const recSort = (arr: CategoryNode[]) => {
    if (!arr?.length) return;
    arr.sort((a, b) => {
      const av = (a as any)[sortBy] ?? 0;
      const bv = (b as any)[sortBy] ?? 0;
      return (av - bv) * dir;
    });
    arr.forEach((n) => recSort(n.children!));
  };
  recSort(roots);

  return roots;
}
