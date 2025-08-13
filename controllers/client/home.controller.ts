import { Request, Response } from "express";

// [GET] /
export const index = async (req: Request, res: Response) => {
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
};
