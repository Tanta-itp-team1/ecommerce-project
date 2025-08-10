(function () {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.some((u) => u.email === "admin@example.com")) {
    users.push({
      id: Date.now(),
      username: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });
    localStorage.setItem("users", JSON.stringify(users));
  }
})();

document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");
    const isVisible = passwordInput.type === "text";

    passwordInput.type = isVisible ? "password" : "text";
    eyeIcon.classList.toggle("bi-eye");
    eyeIcon.classList.toggle("bi-eye-slash");
  });

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const loginBtn = document.getElementById("loginBtn");
  const spinner = document.getElementById("loginBtnSpinner");
  const btnText = document.getElementById("loginBtnText");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let isValid = true;

  emailInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");

  if (!emailRegex.test(email)) {
    emailInput.classList.add("is-invalid");
    isValid = false;
  }

  if (password.length < 6) {
    passwordInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!isValid) return;

  loginBtn.disabled = true;
  spinner.classList.remove("d-none");
  btnText.textContent = "Logging in...";

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));
      new bootstrap.Toast(document.getElementById("loginToast")).show();

      setTimeout(() => {
        if (matchedUser.role === "admin") {
          window.location.href = "../admin/panel.html";
        } else if (matchedUser.role === "seller") {
          window.location.href = "../seller/dashboard.html";
        } else {
          window.location.href = "../../index.html";
        }
      }, 2000);
    } else {
      new bootstrap.Toast(document.getElementById("loginErrorToast")).show();
    }

    spinner.classList.add("d-none");
    btnText.textContent = "Login";
    loginBtn.disabled = false;
  }, 1000);
});
