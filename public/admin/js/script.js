// ===== Particles =====
const initializeParticles = () => {
  const wrap = document.getElementById("particles");
  if (!wrap) return;
  for (let i = 0; i < 50; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDelay = Math.random() * 6 + "s";
    p.style.animationDuration = 3 + Math.random() * 3 + "s";
    wrap.appendChild(p);
  }
};

// ===== Theme =====
const updateThemeIcon = (theme) => {
  const icon = $("#themeToggle i");
  if (!icon.length) return;
  icon
    .removeClass("fa-moon fa-sun")
    .addClass(theme === "dark" ? "fa-sun" : "fa-moon");
};

const toggleTheme = () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  if (next === "dark")
    document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  localStorage.setItem("theme", next);
  updateThemeIcon(next);
};

// ===== Chart (only if canvas exists) =====
const initializeChart = () => {
  const canvas = document.getElementById("revenueChart");
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ],
      datasets: [
        {
          label: "Doanh thu (triệu VNĐ)",
          data: [65, 59, 80, 81, 56, 55, 40, 65, 75, 85, 90, 95],
          borderColor: "#007BFF",
          backgroundColor: "rgba(0,123,255,.12)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top" } },
      scales: { y: { beginAtZero: true }, x: {} },
      animation: { duration: 1200, easing: "easeInOutQuart" },
    },
  });
};

// ===== Toast =====
const showToast = (title, message, type = "info") => {
  const id = "toast-" + Date.now();
  const iconClass = {
    success: "fa-check-circle text-success",
    error: "fa-exclamation-circle text-danger",
    warning: "fa-exclamation-triangle text-warning",
    info: "fa-info-circle text-info",
  }[type];
  const html = `
    <div class="toast" id="${id}" role="status" data-autohide="true" data-delay="4000" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <i class="fas ${iconClass} mr-2"></i>
        <strong class="mr-auto">${title}</strong>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Đóng">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="toast-body">${message}</div>
    </div>`;
  $("#toastContainer").append(html);
  $("#" + id)
    .toast("show")
    .on("hidden.bs.toast", function () {
      $(this).remove();
    });
};

let searchTimer;
const attachSearchToTable = () => {
  const $input = $("#searchInput");
  if (!$input.length || !$("#productsTable").length) return;
  $input.on("input", (e) => {
    clearTimeout(searchTimer);
    const q = e.currentTarget.value.toLowerCase();
    searchTimer = setTimeout(() => {
      $("#productsTableBody tr").each(function () {
        const text = $(this).text().toLowerCase();
        $(this).toggle(text.indexOf(q) > -1);
      });
    }, 120);
  });
};

// ===== Init =====
$(() => {
  // Particles + theme
  initializeParticles();
  const saved = localStorage.getItem("theme");
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon(saved);
  }
  $("#themeToggle").on("click", toggleTheme);

  // Sidebar toggle (mobile)
  $("#sidebarToggle").on("click", () => $("#sidebar").toggleClass("show"));
  $(document).on("click", (e) => {
    if (
      $(window).width() < 768 &&
      !$(e.target).closest("#sidebar, #sidebarToggle").length
    ) {
      $("#sidebar").removeClass("show");
    }
  });

  // Logout
  $("#logoutBtn").on("click", (e) => {
    e.preventDefault();
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      showToast("Đăng xuất", "Đang đăng xuất...", "info");
      setTimeout(() => alert("Đã đăng xuất thành công!"), 800);
    }
  });

  // Table features (only on products page)
  attachSearchToTable();
  $("#sortNameBtn").on("click", () => sortDomBy("name"));
  $("#sortPriceBtn").on("click", () => sortDomBy("price"));
  $("#productsTable thead").on("click keypress", "th[data-sort]", (e) => {
    if (e.type === "click" || e.key === "Enter" || e.key === " ") {
      sortDomBy(e.currentTarget.dataset.sort);
    }
  });

  // Chart (only on dashboard page)
  initializeChart();
});

// status-filter.js
(() => {
  const ATTR = "button-status";

  const isStatus = (val) => val === "active" || val === "inactive";

  const readStatus = (el) => {
    const raw = el.getAttribute(ATTR);
    return isStatus(raw) ? raw : ""; // '' = Tất cả
  };

  const buildNextHref = (nextStatus) => {
    const url = new URL(window.location.href);
    const curStatus = url.searchParams.get("status") || "";

    // Toggle: click lại filter đang active -> xóa param (về Tất cả)
    if (curStatus === nextStatus) {
      url.searchParams.delete("status");
    } else {
      if (nextStatus) url.searchParams.set("status", nextStatus);
      else url.searchParams.delete("status");
    }

    // Đổi filter thì reset trang (nếu có phân trang)
    url.searchParams.delete("page");

    return url.toString();
  };

  const buttons = document.querySelectorAll(`[${ATTR}]`);
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        const status = readStatus(btn);
        const nextHref = buildNextHref(status);
        window.location.href = nextHref;
      },
      { passive: true }
    );
  });
})();

// Search
(() => {
  const FORM_ID = "searchForm";
  const INPUT_NAME = "q";
  const INSTANT_ATTR = "data-instant"; // bật tìm kiếm tức thì khi form có attr này

  const $ = (sel, root = document) => root.querySelector(sel);

  const buildNextHref = (qValue) => {
    const url = new URL(window.location.href);

    // set / delete q
    const q = (qValue || "").trim();
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");

    // giữ nguyên status hiện tại nếu có (đã nằm trong URL)
    // nếu form có input hidden name="status", trình duyệt cũng sẽ gửi lên
    // nhưng ta vẫn giữ ở URL để UX rõ ràng
    // -> KHÔNG động vào 'status' ở đây

    // reset phân trang nếu có
    url.searchParams.delete("page");

    return url.toString();
  };

  const initSearch = () => {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    const input = $(`input[name="${INPUT_NAME}"]`, form);
    if (!input) return;

    // Submit chuẩn (Enter hoặc click nút "Tìm")
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nextHref = buildNextHref(input.value);
      window.location.href = nextHref;
    });

    // Tìm kiếm tức thì (tuỳ chọn): thêm data-instant="true" vào #searchForm
    if (form.hasAttribute(INSTANT_ATTR)) {
      let timer;
      input.addEventListener("input", (e) => {
        clearTimeout(timer);
        const val = e.currentTarget.value;
        timer = setTimeout(() => {
          const nextHref = buildNextHref(val);
          window.location.href = nextHref;
        }, 400); // debounce 400ms
      });
    }
  };

  // Khởi tạo khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch, { once: true });
  } else {
    initSearch();
  }
})();

// Pagination (delegation + guard + clean URL)
(() => {
  const pager = document.querySelector("ul.pagination");
  if (!pager) return;

  // (optional) đọc current & total nếu bạn gắn data-* trong Pug
  const getInt = (v, fb = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fb;
  };
  const current = getInt(pager.dataset.currentPage, 1); // data-current-page
  const total = getInt(pager.dataset.totalPages, 0); // data-total-pages (0 = unknown)

  pager.addEventListener("click", (e) => {
    const btn = e.target.closest("[button-pagination]");
    if (!btn || !pager.contains(btn)) return;

    // nếu cha là .page-item.disabled thì bỏ qua
    if (btn.closest(".page-item.disabled")) return;

    e.preventDefault();

    // lấy số trang mục tiêu
    const targetRaw = btn.getAttribute("button-pagination");
    let target = parseInt(targetRaw || "", 10);
    if (!Number.isFinite(target)) return;

    // nếu có total => clamp vào [1, total]
    if (total > 0) target = Math.max(1, Math.min(total, target));

    // trùng trang hiện tại => khỏi reload
    if (target === current) return;

    // cập nhật URL
    const url = new URL(window.location.href);
    if (target <= 1) url.searchParams.delete("page"); // sạch URL khi về trang 1
    else url.searchParams.set("page", String(target));

    // giữ nguyên các param khác: status, keyword... (vì mình chỉ đụng 'page')
    window.location.href = url.toString();
  });
})();

(() => {
  const table = document.querySelector("table[checkbox-multi]");
  const formBulk = document.querySelector("[form-change-multi]");
  if (!table || !formBulk) return;

  const checkAll = table.querySelector('input[name="checkall"]');
  const rowChecks = table.querySelectorAll('tbody input[name="ids"]');
  const hiddenIds = formBulk.querySelector('input[name="ids"]');
  const btnApply = formBulk.querySelector('button[type="submit"]');
  const selectType = formBulk.querySelector('select[name="type"]');

  const updateHeader = () => {
    const total = rowChecks.length;
    const checked = [...rowChecks].filter((c) => c.checked).length;
    if (!checkAll) return;
    checkAll.indeterminate = checked > 0 && checked < total;
    checkAll.checked = total > 0 && checked === total;
  };

  const updateBulkUI = () => {
    const ids = [...rowChecks].filter((c) => c.checked).map((c) => c.value);
    if (hiddenIds) hiddenIds.value = ids.join(",");
    if (btnApply) btnApply.disabled = ids.length === 0;
  };

  // Thay đổi trong bảng
  table.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;

    if (t.name === "checkall") {
      rowChecks.forEach((c) => {
        c.checked = t.checked;
      });
      updateHeader();
      updateBulkUI(); // cần gọi để bật/tắt nút Áp dụng
    } else if (t.name === "ids") {
      updateHeader();
      updateBulkUI();
    }
  });

  // Submit form: confirm khi delete-all + build payload cho change-position
  formBulk.addEventListener("submit", (e) => {
    e.preventDefault();

    // checkbox đang chọn
    const checked = table.querySelectorAll('tbody input[name="ids"]:checked');
    if (!checked.length) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thay đổi.");
      return;
    }

    const type = selectType && "value" in selectType ? selectType.value : "";

    // Confirm xoá nhiều
    if (type === "delete-all") {
      const ok = confirm(
        "Bạn có chắc muốn XÓA các sản phẩm đã chọn? Hành động này là xóa mềm (deleted=true)."
      );
      if (!ok) return;
    }

    // Tạo payload ids tuỳ theo loại tác vụ
    let payload = "";

    if (type === "change-position") {
      const pairs = [];
      // dùng for...of để có thể break/return sớm khi gặp lỗi
      for (const c of checked) {
        const id = c.value;
        const tr = c.closest("tr");
        const posInput = tr ? tr.querySelector("input[name='position']") : null;
        const position = posInput ? String(posInput.value).trim() : "";

        // Validate đơn giản: yêu cầu có giá trị và là số
        if (position === "" || isNaN(Number(position))) {
          alert("Vui lòng nhập vị trí hợp lệ cho các sản phẩm đã chọn.");
          return; // dừng submit
        }
        pairs.push(`${id}-${position}`);
      }
      payload = pairs.join(",");
    } else {
      // Mặc định: active / inactive / delete-all...
      payload = [...checked].map((c) => c.value).join(",");
    }

    if (hiddenIds) hiddenIds.value = payload;

    // Gửi form (method-override ?_method=PATCH vẫn hoạt động bình thường)
    formBulk.submit();
  });

  // Khởi tạo
  updateHeader();
  updateBulkUI();
})();

// Show alert (đa alert, auto-hide, pause on hover)
(() => {
  const alerts = document.querySelectorAll('[show-alert]');
  if (!alerts.length) return;

  alerts.forEach((alertEl) => {
    const closeBtn = alertEl.querySelector('[close-alert]');

    // thời gian từ data-time hoặc mặc định 4000ms
    const raw = parseInt(alertEl.getAttribute('data-time') || '', 10);
    const timeout = Number.isFinite(raw) && raw > 0 ? raw : 4000;

    const hide = () => {
      // Thêm class để chạy animation CSS rồi remove sau khi xong
      alertEl.classList.add('alert-hidden');
      alertEl.addEventListener('animationend', () => {
        alertEl.remove();
      }, { once: true });
    };

    // Tự ẩn sau timeout
    let t = setTimeout(hide, timeout);

    // Cho phép tạm dừng khi hover
    alertEl.addEventListener('mouseenter', () => clearTimeout(t));
    alertEl.addEventListener('mouseleave', () => {
      // Cho 1 nhịp nhỏ để user rời chuột mượt
      t = setTimeout(hide, 1200);
    });

    // Nút đóng thủ công
    closeBtn && closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hide();
    });
  });
})();
