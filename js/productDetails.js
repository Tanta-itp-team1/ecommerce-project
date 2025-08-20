/* eslint-disable no-undef */
// Retrieve logged-in user
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
let currentProduct = null;

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));

  if (!productId) {
    alert("Product not found.");
    return (window.location.href = "../index.html");
  }

  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
  if (!ecommerceData || !ecommerceData.products) {
    alert("No product data available.");
    return;
  }

  currentProduct = ecommerceData.products.find((p) => p.id === productId);
  if (!currentProduct) {
    document.getElementById("productTitle").textContent = "Product Not Found";
    return;
  }

  if (!currentProduct.reviews) {
    currentProduct.reviews = [];
    const updatedProducts = ecommerceData.products.map(p => p.id === productId ? currentProduct : p);
    ecommerceData.products = updatedProducts;
    localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));
  }

  displayProductDetails(currentProduct);
  renderReviews();
  renderAddReviewForm();
});

// Display product details
function displayProductDetails(product) {
  const finalPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  document.getElementById("productCategory").textContent = product.category;
  document.getElementById("productCategory").href = `../pages/shop.html?category=${encodeURIComponent(product.category)}`;
  document.getElementById("productNameBreadcrumb").textContent = product.name;

  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("productPrice").innerHTML = product.discount > 0
    ? `<span class="text-decoration-line-through text-muted me-2">$${product.price.toFixed(2)}</span>
       <span class="text-danger">$${finalPrice.toFixed(2)}</span>`
    : `$${finalPrice.toFixed(2)}`;

  document.getElementById("productDescription").textContent = product.description;

  const stockElement = document.getElementById("stockStatus");
  stockElement.textContent = product.stock > 0
    ? `In Stock (${product.stock} available)`
    : "Out of Stock";
  stockElement.className = product.stock > 0 ? "text-success" : "text-danger";

  const imgElement = document.getElementById("productMainImage");
  imgElement.src = `../assets/images/products/${product.imageUrl}`;
  imgElement.alt = product.name;

  document.getElementById("reviewCount").textContent = `(${product.reviews.length} Reviews)`;

  document.getElementById("buyNowBtn").onclick = function () {
    addToCart(product.id, parseInt(document.getElementById("quantityInput").value));
  };
}

// Increase quantity
function increaseQuantity() {
  const input = document.getElementById("quantityInput");
  input.value = parseInt(input.value) + 1;
}

// Decrease quantity
function decreaseQuantity() {
  const input = document.getElementById("quantityInput");
  if (input.value > 1) input.value = parseInt(input.value) - 1;
}

// Add to cart
function addToCart(productId, quantity) {
  if (!loggedInUser) {
    showToast("Error", "Please login to add items to your cart.", true);
    setTimeout(() => {
      window.location.href = "../pages/auth/login.html";
    }, 2000);
    return;
  }

  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || { cart: [] };
  let cartEntry = ecommerceData.cart.find((c) => c.userId === loggedInUser.id);
  if (!cartEntry) {
    cartEntry = { userId: loggedInUser.id, items: [] };
    ecommerceData.cart.push(cartEntry);
  }

  const cartItem = cartEntry.items.find((item) => item.productId === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cartEntry.items.push({ productId, quantity });
  }

  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));
  showToast("Success", `${quantity} item(s) added to cart!`);
}

// Render reviews list
function renderReviews() {
  const reviewsList = document.getElementById("reviews-list");
  reviewsList.innerHTML = "";

  if (currentProduct.reviews.length === 0) {
    reviewsList.innerHTML = '<p class="text-muted">No reviews yet.</p>';
    return;
  }

  const users = JSON.parse(localStorage.getItem("ecommerceData"))?.users || [];

  currentProduct.reviews.forEach(review => {
    const user = users.find(u => u.id === review.userId);
    const username = user ? user.name : "Unknown User"; // Use 'name' field
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

    const card = `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="mb-1">${username}</h6>
            <small class="text-muted">${new Date(review.date).toLocaleDateString()}</small>
          </div>
          <p class="text-warning mb-1">${stars}</p>
          <p class="mb-0">${review.comment}</p>
        </div>
      </div>
    `;
    reviewsList.insertAdjacentHTML('beforeend', card);
  });
}

// Render Add Review Form with Star Rating
function renderAddReviewForm() {
  const section = document.getElementById("add-review-section");
  section.innerHTML = "";

  if (!loggedInUser) {
    section.innerHTML = `<p class="text-muted">Please <a href="../pages/auth/login.html">login</a> to leave a review.</p>`;
    return;
  }

  const hasReviewed = currentProduct.reviews.some(r => r.userId === loggedInUser.id);
  if (hasReviewed) {
    section.innerHTML = `<p class="text-success"><i class="bi bi-check-circle"></i> You have already reviewed this product.</p>`;
    return;
  }

  // Star rating UI
  const starRatingHTML = `
    <div class="mb-3">
      <label class="form-label">Your Rating</label>
      <div id="star-rating" class="fs-4">
        <span class="star" data-value="1">☆</span>
        <span class="star" data-value="2">☆</span>
        <span class="star" data-value="3">☆</span>
        <span class="star" data-value="4">☆</span>
        <span class="star" data-value="5">☆</span>
      </div>
      <input type="hidden" id="rating-value" required>
      <div class="invalid-feedback">Please select a rating.</div>
    </div>
  `;

  section.innerHTML = `
    <div class="card p-3 mb-4">
      <h5>Write a Review</h5>
      <form id="reviewForm">
        ${starRatingHTML}
        <div class="mb-3">
          <label for="comment" class="form-label">Your Comment</label>
          <textarea class="form-control" id="comment" rows="3" placeholder="Share your thoughts..." required></textarea>
        </div>
        <button type="submit" class="btn btn-danger">Submit Review</button>
      </form>
    </div>
  `;

  // Add star click event
  const stars = document.querySelectorAll("#star-rating .star");
  const ratingInput = document.getElementById("rating-value");

  stars.forEach(star => {
    star.addEventListener("click", function () {
      const value = parseInt(this.getAttribute("data-value"));
      ratingInput.value = value;

      // Update stars
      stars.forEach(s => {
        s.textContent = parseInt(s.getAttribute("data-value")) <= value ? '★' : '☆';
        s.style.color = parseInt(s.getAttribute("data-value")) <= value ? '#ffc107' : 'initial';
      });
    });
  });

  // Form submit
  document.getElementById("reviewForm").addEventListener("submit", handleReviewSubmit);
}

// Handle review submission
function handleReviewSubmit(e) {
  e.preventDefault();

  const ratingInput = document.getElementById("rating-value");
  const comment = document.getElementById("comment").value.trim();
  const rating = parseInt(ratingInput.value);

  if (!rating) {
    ratingInput.classList.add("is-invalid");
    return;
  } else {
    ratingInput.classList.remove("is-invalid");
  }

  const newReview = {
    userId: loggedInUser.id,
    rating,
    comment,
    date: new Date().toISOString()
  };

  currentProduct.reviews.push(newReview);

  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
  const updatedProducts = ecommerceData.products.map(p => p.id === currentProduct.id ? currentProduct : p);
  ecommerceData.products = updatedProducts;
  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

  showToast("Review Submitted", "Thank you for your feedback!");

  // Re-render
  renderReviews();
  renderAddReviewForm();
}

// Show toast
function showToast(title, message, isError = false) {
  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastBody").textContent = message;
  const toastEl = document.getElementById("buyToast");
  if (isError) {
    toastEl.classList.add("bg-danger", "text-white");
  } else {
    toastEl.classList.remove("bg-danger", "text-white");
  }

  new bootstrap.Toast(toastEl).show();
}