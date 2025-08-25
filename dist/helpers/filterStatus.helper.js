"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFilterStatus = exports.isStatus = void 0;
const isStatus = (val) => val === "active" || val === "inactive";
exports.isStatus = isStatus;
const makeFilterStatus = (statusParam) => {
    const filterStatus = [
        { name: "Tất cả", status: "", class: "" },
        { name: "Hoạt động", status: "active", class: "" },
        { name: "Dừng hoạt động", status: "inactive", class: "" },
    ];
    const currentStatus = (0, exports.isStatus)(statusParam) ? statusParam : "";
    const activeIdx = currentStatus === ""
        ? 0
        : filterStatus.findIndex((i) => i.status === currentStatus);
    filterStatus[activeIdx >= 0 ? activeIdx : 0].class = "active";
    return { filterStatus, currentStatus };
};
exports.makeFilterStatus = makeFilterStatus;
