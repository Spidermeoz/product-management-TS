// helpers/search.helper.ts

/** Các field có thể search, mặc định ['title'] */
export interface SearchOptions {
  fields?: string[];     // ví dụ: ['title', 'sku']
  paramKey?: string;     // tên tham số query, mặc định 'keyword'
}

/** Kết quả trả về từ helper */
export interface SearchResult {
  keyword: string;       // từ khóa đã chuẩn hóa (trim)
  criteria?: Record<string, unknown>; // điều kiện để merge vào Mongo query
}

/** Escape kí tự đặc biệt để dùng an toàn trong RegExp */
export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Lấy keyword từ query (unknown-safe) và trim */
export const parseKeyword = (val: unknown): string =>
  typeof val === "string" ? val.trim() : "";

/**
 * Tạo tiêu chí tìm kiếm RegExp không phân biệt hoa/thường.
 * - Nếu có 1 field -> { field: /keyword/i }
 * - Nếu nhiều field -> { $or: [{field1:/.../i}, {field2:/.../i}] }
 */
export const buildSearchCriteria = (
  keyword: string,
  fields: string[] = ["title"]
): Record<string, unknown> | undefined => {
  if (!keyword) return undefined;
  const rx = new RegExp(escapeRegex(keyword), "i");

  if (fields.length <= 1) {
    const f = fields[0] || "title";
    return { [f]: rx };
  }
  return { $or: fields.map((f) => ({ [f]: rx })) };
};

/**
 * Tổ hợp tiện dụng: đọc keyword từ req.query, tạo criteria để đưa vào Mongo find
 * @example
 *   const { keyword, criteria } = makeSearch(req.query, { fields: ['title','sku'] });
 *   const find = { deleted: false, ...(criteria||{}) };
 */
export const makeSearch = (
  query: Record<string, unknown>,
  opts: SearchOptions = {}
): SearchResult => {
  const { fields = ["title"], paramKey = "keyword" } = opts;
  const keyword = parseKeyword(query[paramKey]);
  const criteria = buildSearchCriteria(keyword, fields);
  return { keyword, criteria };
};
