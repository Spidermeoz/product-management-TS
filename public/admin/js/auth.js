(function () {
  var form = document.getElementById("loginForm");
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var btnToggle = document.querySelector(".type-toggle");

  function setInvalid(ctrl, key, msg) {
    if (!ctrl) return false;
    var group = ctrl.closest(".form-group");
    var feedback = document.querySelector(
      '.invalid-feedback[data-for="' + key + '"]'
    );
    ctrl.classList.add("is-invalid");
    ctrl.setAttribute("aria-invalid", "true");
    if (group) group.classList.add("has-error");
    if (feedback) {
      feedback.textContent = msg || feedback.textContent;
    }
    return false;
  }

  function clearInvalid(ctrl) {
    if (!ctrl) return true;
    var group = ctrl.closest(".form-group");
    ctrl.classList.remove("is-invalid");
    ctrl.removeAttribute("aria-invalid");
    if (group) group.classList.remove("has-error");
    return true;
  }

  function validateEmail() {
    if (!email) return true;
    var val = email.value.trim();
    if (val === "") return setInvalid(email, "email", "Vui lòng nhập email.");
    // dùng HTML5 validity cho chuẩn RFC
    if (!email.checkValidity())
      return setInvalid(
        email,
        "email",
        "Email không hợp lệ. Ví dụ: name@domain.com"
      );
    return clearInvalid(email);
  }

  function validatePassword() {
    if (!password) return true;
    var val = password.value || "";
    if (val.trim() === "")
      return setInvalid(password, "password", "Vui lòng nhập mật khẩu.");
    if (val.length < 4)
      return setInvalid(password, "password", "Mật khẩu tối thiểu 4 ký tự.");
    return clearInvalid(password);
  }

  // Realtime validation
  if (email) {
    email.addEventListener("input", validateEmail);
    email.addEventListener("blur", validateEmail);
  }
  if (password) {
    password.addEventListener("input", validatePassword);
    password.addEventListener("blur", validatePassword);
  }

  // Submit chặn nếu invalid
  if (form) {
    form.addEventListener("submit", function (e) {
      var okEmail = validateEmail();
      var okPwd = validatePassword();
      if (!okEmail || !okPwd) {
        e.preventDefault();
        form.classList.add("was-validated"); // chỉ để style focus viền
      }
    });
  }

  // Toggle password
  if (btnToggle && password) {
    btnToggle.addEventListener("click", function () {
      var isHidden = password.getAttribute("type") === "password";
      password.setAttribute("type", isHidden ? "text" : "password");
      var icon = btnToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  }
})();
