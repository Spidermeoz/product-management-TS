//Change status
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonsChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector("#form-change-status");
  const path = formChangeStatus.getAttribute("data-path");

  buttonsChangeStatus.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn gửi form mặc định
      const statusCurrent = button.getAttribute("data-status");
      const id = button.getAttribute("data-id");

      let statusChange = statusCurrent === "active" ? "inactive" : "active";

      const action = path + `/${statusChange}/${id}?_method=PATCH`;
      formChangeStatus.action = action;

      formChangeStatus.submit();
    });
  });
}//End Change status

// Xóa sản phẩm (ưu tiên submit form d-inline, fallback dùng form ẩn)
(() => {
  const buttonsDelete = document.querySelectorAll("[button-delete]");
  if (!buttonsDelete.length) return;

  const fallbackForm = document.querySelector("#form-delete-item");
  const basePath = fallbackForm?.getAttribute("data-path") || "";

  buttonsDelete.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const ok = confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?");
      if (!ok) return;

      // 1) Ưu tiên: submit form d-inline đang bọc nút (đã có action đúng)
      const rowForm = btn.closest("form");
      if (rowForm && rowForm.action) {
        rowForm.submit();
        return;
      }

      // 2) Fallback: lấy id từ <tr data-id="..."> hoặc từ data-id trên nút
      const tr = btn.closest("tr");
      const id =
        btn.getAttribute("data-id") ||
        tr?.getAttribute("data-id") ||
        "";

      if (!id) {
        alert("Không tìm thấy ID sản phẩm!");
        return;
      }

      if (!fallbackForm || !basePath) {
        alert("Thiếu form hoặc đường dẫn xóa!");
        return;
      }

      // Đảm bảo có dấu "/" đầu để tránh relative path
      const path =
        basePath.startsWith("/") ? basePath : `/${basePath}`;

      fallbackForm.action = `${path}/${id}?_method=DELETE`;
      fallbackForm.submit();
    });
  });
})();

// Preview ảnh + cập nhật label cho custom-file
(() => {
  const input = document.getElementById('thumbnail');
  const label = document.querySelector('label.custom-file-label[for="thumbnail"]');
  const previewImg = document.getElementById('thumbPreview');
  const previewBox = previewImg ? previewImg.closest('.thumb-preview') : null;

  if (!input || !label || !previewImg || !previewBox) return;

  const setPreview = (file) => {
    const isImage = file && file.type && file.type.startsWith('image/');
    if (!isImage) {
      // reset preview
      previewImg.removeAttribute('src');
      previewBox.classList.remove('has-image');
      label.textContent = 'Chọn ảnh...';
      return;
    }
    // Đổi text label
    label.textContent = file.name;

    // Preview
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = String(e.target.result || '');
      previewBox.classList.add('has-image');
      previewImg.setAttribute('aria-hidden', 'false');
    };
    reader.readAsDataURL(file);
  };

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) {
      // không có file
      previewImg.removeAttribute('src');
      previewBox.classList.remove('has-image');
      label.textContent = 'Chọn ảnh...';
      return;
    }
    setPreview(file);
  });
})();

// JS gập/mở nhánh
(() => {
  const tbody = document.querySelector('#productsTableBody');
  if (!tbody) return;

  // Ẩn toàn bộ con ngay khi load (nếu HTML chưa bị rule CSS ẩn sẵn)
  // [...tbody.querySelectorAll('tr.is-child')].forEach(tr => tr.style.display = 'none');

  // Helper: lấy tất cả con cháu của 1 id
  const getDescendants = (parentId) => {
    const all = [...tbody.querySelectorAll('tr[data-parent]')];
    const out = [];
    const stack = [parentId];

    while (stack.length) {
      const pid = stack.pop();
      const children = all.filter(r => r.dataset.parent === String(pid));
      children.forEach(ch => {
        out.push(ch);
        stack.push(ch.dataset.id);
      });
    }
    return out;
  };

  // Toggle 1 node
  const toggleNode = (btn) => {
    const id = btn?.dataset?.id;
    if (!id) return;

    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    btn.setAttribute('aria-expanded', String(next));

    // Lấy toàn bộ con cháu
    const descendants = getDescendants(id);

    if (!next) {
      // Đóng: ẩn tất cả con cháu, đồng thời reset caret của các nút con về false
      descendants.forEach(tr => {
        tr.style.display = 'none';
        const subBtn = tr.querySelector('.tree-toggle[aria-expanded="true"]');
        if (subBtn) subBtn.setAttribute('aria-expanded', 'false');
      });
    } else {
      // Mở: chỉ hiện các con trực tiếp (không bung cả cháu)
      const directChildren = descendants.filter(tr => tr.dataset.parent === String(id));
      directChildren.forEach(tr => tr.style.display = 'table-row');
    }
  };

  // Delegation: click vào nút caret
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.tree-toggle');
    if (!btn) return;
    e.preventDefault();
    toggleNode(btn);
  });
})();

(() => {
  const sel = document.getElementById('parent-id');
  if (!sel) return;
  const url = new URL(window.location.href);
  const q = url.searchParams.get('parent_id');
  if (q && !sel.value) sel.value = q;
})();