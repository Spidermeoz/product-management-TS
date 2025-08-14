import { Request, Response } from "express";

// [GET] /admin/dashboard
export const index = async (req: Request, res: Response) => {
  const productsData = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      price: 29990000,
      status: "active",
      image: "https://via.placeholder.com/100x100/007BFF/FFFFFF?text=iPhone",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      price: 24990000,
      status: "active",
      image: "https://via.placeholder.com/100x100/28A745/FFFFFF?text=Samsung",
    },
    {
      id: 3,
      name: "MacBook Pro M3",
      price: 52990000,
      status: "inactive",
      image: "https://via.placeholder.com/100x100/DC3545/FFFFFF?text=MacBook",
    },
    {
      id: 4,
      name: "iPad Air",
      price: 16990000,
      status: "active",
      image: "https://via.placeholder.com/100x100/FFC107/000000?text=iPad",
    },
    {
      id: 5,
      name: "AirPods Pro",
      price: 6990000,
      status: "active",
      image: "https://via.placeholder.com/100x100/17A2B8/FFFFFF?text=AirPods",
    },
  ];

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    activePage: "products",
    products: productsData
  });
};
