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
  icon.removeClass("fa-moon fa-sun").addClass(theme === "dark" ? "fa-sun" : "fa-moon");
};

const toggleTheme = () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
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
      labels: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"],
      datasets: [{
        label: "Doanh thu (triệu VNĐ)",
        data: [65,59,80,81,56,55,40,65,75,85,90,95],
        borderColor: "#007BFF",
        backgroundColor: "rgba(0,123,255,.12)",
        borderWidth: 3,
        fill: true,
        tension: .4,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top" } },
      scales: { y: { beginAtZero: true }, x: {} },
      animation: { duration: 1200, easing: "easeInOutQuart" }
    }
  });
};

// ===== Toast =====
const showToast = (title, message, type = "info") => {
  const id = "toast-" + Date.now();
  const iconClass = {
    success: "fa-check-circle text-success",
    error: "fa-exclamation-circle text-danger",
    warning: "fa-exclamation-triangle text-warning",
    info: "fa-info-circle text-info"
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
  $("#" + id).toast("show").on("hidden.bs.toast", function () { $(this).remove(); });
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
    if ($(window).width() < 768 && !$(e.target).closest("#sidebar, #sidebarToggle").length) {
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
  const ATTR = 'button-status';

  const isStatus = (val) => val === 'active' || val === 'inactive';

  const readStatus = (el) => {
    const raw = el.getAttribute(ATTR);
    return isStatus(raw) ? raw : ''; // '' = Tất cả
  };

  const buildNextHref = (nextStatus) => {
    const url = new URL(window.location.href);
    const curStatus = url.searchParams.get('status') || '';

    // Toggle: click lại filter đang active -> xóa param (về Tất cả)
    if (curStatus === nextStatus) {
      url.searchParams.delete('status');
    } else {
      if (nextStatus) url.searchParams.set('status', nextStatus);
      else url.searchParams.delete('status');
    }

    // Đổi filter thì reset trang (nếu có phân trang)
    url.searchParams.delete('page');

    return url.toString();
  };

  const buttons = document.querySelectorAll(`[${ATTR}]`);
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener(
      'click',
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
