// Khởi tạo Isotope sau khi ảnh đã load
const initIsotope = () => {
  const $grid = $(".product-lists").isotope({
    itemSelector: ".col-lg-4", // cột Bootstrap
    layoutMode: "fitRows",
    percentPosition: true,
  });

  // Chạy layout lại sau khi ảnh trong grid load xong
  $(".product-lists").imagesLoaded(() => {
    $grid.isotope("layout");
  });

  // Chạy layout lại khi trang load hoàn toàn (phòng khi font/ảnh lazy load)
  $(window).on("load", () => {
    $grid.isotope("layout");
  });

  // Bind bộ lọc
  $(".product-filters li").on("click", function () {
    $(".product-filters li").removeClass("active");
    $(this).addClass("active");
    const filterVal = $(this).attr("data-filter");
    $grid.isotope({ filter: filterVal });
  });
};

// Khởi chạy khi DOM ready
$(() => {
  initIsotope();
});
