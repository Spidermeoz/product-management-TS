"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePagination = void 0;
const parsePage = (val) => {
    const n = typeof val === "string" ? parseInt(val, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 1;
};
const makePagination = (input) => {
    const limit = typeof input.limit === "number" && input.limit > 0 ? input.limit : 6;
    const totalItems = Math.max(0, input.totalItems);
    const totalPages = Math.ceil(totalItems / limit);
    let currentPage = parsePage(input.page);
    if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    }
    const skip = totalPages === 0 ? 0 : (currentPage - 1) * limit;
    return {
        currentPage,
        limitItems: limit,
        skip,
        totalPages,
        totalItems,
    };
};
exports.makePagination = makePagination;
