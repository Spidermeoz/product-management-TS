"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ",
        testimonials: [
            {
                img: "avatar1.jpg",
                name: "Anh Long",
                role: "Chủ cửa hàng địa phương",
                text: "Dường như tất cả lỗi lầm đều đến từ sự thiếu sót không thể tránh khỏi, nhưng từ đó ta có thể học hỏi và xây dựng cuộc sống tốt đẹp hơn.",
            },
            {
                img: "avatar2.jpg",
                name: "David Nộp",
                role: "Chủ cửa hàng địa phương",
                text: "Sự thành công không đến từ việc tránh sai lầm, mà từ việc đứng dậy và học hỏi từ chúng.",
            },
            {
                img: "avatar4.jpg",
                name: "Jack 97",
                role: "Chủ cửa hàng địa phương",
                text: "Sự thành công không đến từ việc tránh sai lầm, mà từ việc đứng dậy và học hỏi từ chúng.",
            },
            {
                img: "avatar3.jpg",
                name: "MCK",
                role: "Chủ cửa hàng địa phương",
                text: "Cuộc sống là hành trình vượt qua những khó khăn và trân trọng mọi khoảnh khắc đã trải qua.",
            },
        ],
        listNews: [
            {
                bg: "news-bg-1",
                title: "Bạn sẽ khó tìm thấy trái cây vào mùa thu.",
                date: "27 Tháng 12, 2019",
            },
            {
                bg: "news-bg-2",
                title: "Giá trị của một người cũng có mùa như quả cà chua.",
                date: "27 Tháng 12, 2019",
            },
            {
                bg: "news-bg-3",
                title: "Suy nghĩ tích cực mang đến trái ngọt tươi ngon.",
                date: "27 Tháng 12, 2019",
            },
        ],
    });
});
exports.index = index;
