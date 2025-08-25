"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCategoryTree = buildCategoryTree;
function buildCategoryTree(docs, opts = { sortBy: "position", dir: 1 }) {
    var _a, _b, _c, _d;
    const sortBy = (_a = opts.sortBy) !== null && _a !== void 0 ? _a : "position";
    const dir = (_b = opts.dir) !== null && _b !== void 0 ? _b : 1;
    const map = new Map();
    for (const d of docs) {
        const id = String((_c = d._id) !== null && _c !== void 0 ? _c : "");
        if (!id)
            continue;
        const node = {
            _id: id,
            parent_id: d.parent_id ? String(d.parent_id) : "",
            position: typeof d.position === "number"
                ? d.position
                : Number((_d = d.position) !== null && _d !== void 0 ? _d : 0),
            title: d.title,
            thumbnail: d.thumbnail,
            status: d.status,
            children: [],
        };
        for (const k in d) {
            if (!(k in node))
                node[k] = d[k];
        }
        map.set(id, node);
    }
    const roots = [];
    for (const node of map.values()) {
        const pid = node.parent_id || "";
        if (pid && map.has(pid)) {
            map.get(pid).children.push(node);
        }
        else {
            roots.push(node);
        }
    }
    const recSort = (arr) => {
        if (!(arr === null || arr === void 0 ? void 0 : arr.length))
            return;
        arr.sort((a, b) => {
            var _a, _b;
            const av = (_a = a[sortBy]) !== null && _a !== void 0 ? _a : 0;
            const bv = (_b = b[sortBy]) !== null && _b !== void 0 ? _b : 0;
            return (av - bv) * dir;
        });
        arr.forEach((n) => recSort(n.children));
    };
    recSort(roots);
    return roots;
}
