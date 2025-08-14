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

// Delete product
const buttonsDelete = document.querySelectorAll("[button-delete]");
if(buttonsDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");
  buttonsDelete.forEach((button) => {
    button.addEventListener("click", () => {
      isConfirm = confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?");
      if (isConfirm) {
        const id = button.getAttribute("data-id");
        
        const action = path + `/${id}?_method=DELETE`;

        formDeleteItem.action = action;
        // Gửi form
        formDeleteItem.submit();
        if (!id) {
          alert("Không tìm thấy ID sản phẩm!");
          return;
        }
      }
    });
  });
}
// End delete product

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
