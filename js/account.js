//All fields
const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const email = document.getElementById("email");
const address = document.getElementById("address");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
//all btns
const cancel = document.getElementById("cancel");
const save = document.getElementById("save");
//get the logedin user from local storage
let user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user) window.location.href = "../pages/auth/login.html";
fname.value = user.name.split(" ")[0];
lname.value = user.name.split(" ")[1];
email.value = user.email;
address.value = user.address ?? "";
//btns onclicking
//cancel btn
cancel.addEventListener("click", () => {
  // Reset field values
  fname.value = user.name.split(" ")[0];
  lname.value = user.name.split(" ")[1];
  email.value = user.email;
  address.value = user.address ?? "";

  // Remove validation borders
  [fname, lname, email].forEach((field) =>
    field.classList.remove("is-invalid")
  );

  // Clear alert
  document.getElementById("alert-container").innerHTML = "";
});

//save btn
save.addEventListener("click", (e) => {
  e.preventDefault();
  // Remove any previous invalid styling
  [fname, lname, email, currentPassword, newPassword, confirmPassword].forEach(
    (field) => field.classList.remove("is-invalid")
  );
  // Check empty fields
  if (!fname.value.trim()) {
    fname.classList.add("is-invalid");
    fname.focus();
    showAlert("First name cannot be empty.", "danger");
    return;
  }

  if (!lname.value.trim()) {
    lname.classList.add("is-invalid");
    lname.focus();
    showAlert("Last name cannot be empty.", "danger");
    return;
  }

  if (!email.value.trim()) {
    email.classList.add("is-invalid");
    email.focus();
    showAlert("Email cannot be empty.", "danger");
    return;
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    email.classList.add("is-invalid");
    email.focus();
    showAlert("Please enter a valid email address.", "danger");
    return;
  }
  // --- PASSWORD VALIDATION (if any field is filled, validate all) ---
  if (currentPassword.value || newPassword.value || confirmPassword.value) {
    // Check current password matches stored password
    if (currentPassword.value !== user.password) {
      currentPassword.classList.add("is-invalid");
      currentPassword.focus();
      showAlert("Current password is incorrect.", "danger");
      return;
    }

    // Check new password not empty
    if (!newPassword.value) {
      newPassword.classList.add("is-invalid");
      newPassword.focus();
      showAlert("New password cannot be empty.", "danger");
      return;
    }

    // Check confirm password matches
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.classList.add("is-invalid");
      confirmPassword.focus();
      showAlert("Passwords do not match.", "danger");
      return;
    }

    // Update stored password
    user.password = newPassword.value;
  }
  let updated = false;
  // Check if any field changed
  if (
    user.name.split(" ")[0] !== fname.value ||
    user.name.split(" ")[1] !== lname.value ||
    user.email !== email.value ||
    (user.address ?? "") !== address.value
  ) {
    // Update user object
    user.name = `${fname.value} ${lname.value}`;
    user.email = email.value;
    user.address = address.value;
    updated = true;
  }
  if (updated || (newPassword.value && confirmPassword.value)) {
    // Save to loggedInUser
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // Update ecommerceData
    let ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
    const indexOfTargetUser = ecommerceData.users.findIndex(
      (u) => u.id === user.id
    );
    if (indexOfTargetUser !== -1) {
      ecommerceData.users[indexOfTargetUser] = user;
      localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));
    }

    showAlert("User updated successfully.", "success");
  } else {
    showAlert("No changes detected.", "warning");
  }
});
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}
