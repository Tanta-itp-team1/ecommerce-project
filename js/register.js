const data = JSON.parse(localStorage.getItem("ecommerceData"));
const existingUsers = data["users"] || [];
if (existingUsers.length === 0) {
  const dummyAdmin = {
    id: Date.now(),
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  };
  localStorage.setItem("ecommerceData", JSON.stringify([dummyAdmin]));
}
document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const passwordIcon = document.getElementById("passwordIcon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      passwordIcon.classList.remove("bi-eye");
      passwordIcon.classList.add("bi-eye-slash");
    } else {
      passwordInput.type = "password";
      passwordIcon.classList.remove("bi-eye-slash");
      passwordIcon.classList.add("bi-eye");
    }
  });

document
  .getElementById("toggleConfirmPassword")
  .addEventListener("click", function () {
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const confirmPasswordIcon = document.getElementById("confirmPasswordIcon");

    if (confirmPasswordInput.type === "password") {
      confirmPasswordInput.type = "text";
      confirmPasswordIcon.classList.remove("bi-eye");
      confirmPasswordIcon.classList.add("bi-eye-slash");
    } else {
      confirmPasswordInput.type = "password";
      confirmPasswordIcon.classList.remove("bi-eye-slash");
      confirmPasswordIcon.classList.add("bi-eye");
    }
  });

document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const role = document.getElementById("role");
    const registerBtn = this.querySelector('button[type="submit"]');

    [username, email, password, confirmPassword, role].forEach((input) => {
      input.classList.remove("is-invalid");
    });

    let isValid = true;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,}$/;

    if (!usernameRegex.test(username.value.trim())) {
      username.classList.add("is-invalid");
      isValid = false;
    }
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailRegex =
      /^(?!\.)(?!.*\.\.)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

    if (username.value.trim() === "") {
      username.classList.add("is-invalid");
      isValid = false;
    }

    if (!emailRegex.test(email.value.trim())) {
      email.classList.add("is-invalid");
      isValid = false;
    }

    if (password.value.trim().length < 6) {
      password.classList.add("is-invalid");
      isValid = false;
    }

    if (confirmPassword.value.trim() !== password.value.trim()) {
      confirmPassword.classList.add("is-invalid");
      isValid = false;
    }

    if (role.value === "") {
      role.classList.add("is-invalid");
      isValid = false;
    }

    if (!isValid) return;

    registerBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Registering...`;
    registerBtn.disabled = true;
    const data = JSON.parse(localStorage.getItem("ecommerceData"));
    const users = data["users"] || [];
    const emailExists = users.some((user) => user.email === email.value.trim());

    setTimeout(() => {
      if (emailExists) {
        const errorToast = document.getElementById("toastError");
        const bsErrorToast = new bootstrap.Toast(errorToast);
        bsErrorToast.show();

        registerBtn.innerHTML = `Register`;
        registerBtn.disabled = false;
      } else {
        const newUser = {
          id: Date.now(),
          username: username.value.trim(),
          email: email.value.trim(),
          password: password.value.trim(),
          role: role.value,
        };

        users.push(newUser);
        localStorage.setItem("ecommerceData", JSON.stringify(data));

        const successToast = document.getElementById("toastSuccess");
        const bsSuccessToast = new bootstrap.Toast(successToast);
        bsSuccessToast.show();
        registerBtn.innerHTML = `Register`;
        registerBtn.disabled = false;

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      }
    }, 1000);

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-secondary");
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Registering...';

    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary");
      btn.innerHTML = "Register";
    }, 2000);
  });
