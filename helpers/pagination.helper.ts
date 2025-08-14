export interface PaginationInput {
  page?: unknown; // giá trị từ req.query.page (có thể là string | undefined)
  totalItems: number; // tổng số bản ghi (countDocuments)
  limit?: number; // số item mỗi trang (mặc định 6)
}

export interface PaginationState {
  currentPage: number; // trang hiện tại (>=1)
  limitItems: number; // limit
  skip: number; // (currentPage - 1) * limit
  totalPages: number; // tổng số trang (có thể = 0 nếu không có dữ liệu)
  totalItems: number; // tổng số bản ghi
}

/** Parse page an toàn, mặc định 1 nếu không hợp lệ */
const parsePage = (val: unknown): number => {
  const n = typeof val === "string" ? parseInt(val, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1;
};

/**
 * Tạo đối tượng phân trang từ tổng số bản ghi + page query.
 * - totalPages = Math.ceil(totalItems / limit)
 * - Nếu totalPages = 0 (không có dữ liệu), currentPage vẫn trả về 1 và skip = 0
 * - Nếu currentPage > totalPages (>0), tự động clamp về totalPages
 */
export const makePagination = (input: PaginationInput): PaginationState => {
  const limit =
    typeof input.limit === "number" && input.limit > 0 ? input.limit : 6;
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
