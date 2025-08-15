const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
let currentProduct = null;

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));

  if (!productId) {
    console.error("No product ID found in URL");
    window.location.href = "../index.html";
    return;
  }
  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
  if (!ecommerceData) {
    console.error("No ecommerce data found");
    return;
  }
  // Find the product
  currentProduct = ecommerceData.products.find((p) => p.id === productId);

  if (!currentProduct) {
    console.error("Product not found");
    document.getElementById("productTitle").textContent = "Product not found";
    return;
  }
  // Display the product
  displayProductDetails(currentProduct);
});
function displayProductDetails(product) {
  // Calculate price with discount
  const finalPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  // Update breadcrumbs
  document.getElementById("productCategory").textContent = product.category;
  document.getElementById(
    "productCategory"
  ).href = `../index.html?category=${encodeURIComponent(product.category)}`;
  document.getElementById("productNameBreadcrumb").textContent = product.name;

  // Update main product info
  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("productPrice").innerHTML =
    product.discount > 0
      ? `<span class="text-decoration-line-through text-muted me-2">$${product.price.toFixed(
          2
        )}</span>
                   <span class="text-danger">$${finalPrice.toFixed(2)}</span>`
      : `$${finalPrice.toFixed(2)}`;

  document.getElementById("productDescription").textContent =
    product.description;
  // Update stock status
  const stockElement = document.getElementById("stockStatus");
  if (product.stock > 0) {
    stockElement.textContent = `In Stock (${product.stock} available)`;
    stockElement.className = "text-success";
  } else {
    stockElement.textContent = "Out of Stock";
    stockElement.className = "text-danger";
  }
  // Update image
  const imgElement = document.getElementById("productMainImage");
  imgElement.src = `../assets/images/products/${product.imageUrl}`;
  imgElement.alt = product.name;

  // Update review count
  document.getElementById(
    "reviewCount"
  ).textContent = `(${product.soldCount} Reviews)`;

  // Update buy now button
  document.getElementById("buyNowBtn").onclick = function () {
    addToCart(
      product.id,
      parseInt(document.getElementById("quantityInput").value)
    );
  };
}
function increaseQuantity() {
  const input = document.getElementById("quantityInput");
  input.value = parseInt(input.value) + 1;
}
function decreaseQuantity() {
  const input = document.getElementById("quantityInput");
  if (input.value > 1) input.value = parseInt(input.value) - 1;
}

function addToCart(productId, quantity) {
  if (!loggedInUser) {
    alert("Please login to add items to your cart");
    window.location.href = "../pages/auth/login.html";
    return;
  }
  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || {
    cart: [],
  };
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

  const toast = new bootstrap.Toast(document.getElementById("buyToast"));

  const toastBody = document.querySelector(".toast-body");
  if (quantity > 1) {
    toastBody.textContent = `${quantity} items added to cart successfully!`;
  } else {
    toastBody.textContent = "Product added to cart successfully!";
  }
  toast.show();
}
