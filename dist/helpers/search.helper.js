"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSearch = exports.buildSearchCriteria = exports.parseKeyword = exports.escapeRegex = void 0;
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
exports.escapeRegex = escapeRegex;
const parseKeyword = (val) => typeof val === "string" ? val.trim() : "";
exports.parseKeyword = parseKeyword;
const buildSearchCriteria = (keyword, fields = ["title"]) => {
    if (!keyword)
        return undefined;
    const rx = new RegExp((0, exports.escapeRegex)(keyword), "i");
    if (fields.length <= 1) {
        const f = fields[0] || "title";
        return { [f]: rx };
    }
    return { $or: fields.map((f) => ({ [f]: rx })) };
};
exports.buildSearchCriteria = buildSearchCriteria;
const makeSearch = (query, opts = {}) => {
    const { fields = ["title"], paramKey = "keyword" } = opts;
    const keyword = (0, exports.parseKeyword)(query[paramKey]);
    const criteria = (0, exports.buildSearchCriteria)(keyword, fields);
    return { keyword, criteria };
};
exports.makeSearch = makeSearch;
