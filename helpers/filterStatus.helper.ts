export type Status = "active" | "inactive";

export interface FilterStatusItem {
  name: string;
  status: Status | "";
  class: "" | "active";
}

/** Type guard cho status hợp lệ */
export const isStatus = (val: unknown): val is Status =>
  val === "active" || val === "inactive";

/**
 * Tạo mảng filterStatus và xác định trạng thái hiện tại
 * @param statusParam - giá trị status lấy từ query (có thể không hợp lệ)
 * @returns { filterStatus, currentStatus }
 */
export const makeFilterStatus = (
  statusParam?: unknown
): { filterStatus: FilterStatusItem[]; currentStatus: Status | "" } => {
  const filterStatus: FilterStatusItem[] = [
    { name: "Tất cả",        status: "",         class: "" },
    { name: "Hoạt động",     status: "active",   class: "" },
    { name: "Dừng hoạt động",status: "inactive", class: "" },
  ];

  const currentStatus: Status | "" = isStatus(statusParam) ? statusParam : "";
  const activeIdx =
    currentStatus === ""
      ? 0
      : filterStatus.findIndex((i) => i.status === currentStatus);

  filterStatus[activeIdx >= 0 ? activeIdx : 0].class = "active";

  return { filterStatus, currentStatus };
};
