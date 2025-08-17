// ===== Login Check =====
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || [];
const loggedInUserEmail = loggedInUser["email"];
if (!loggedInUserEmail) {
  // User not logged in → redirect to login
  window.location.href = "../pages/auth/login.html";
}

// ===== Load Data =====
let ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || [];

// Find logged-in user
const currentUser = ecommerceData["users"].find(
  (user) => user.email === loggedInUserEmail
);

if (!currentUser) {
  // No matching user found → clear login & redirect
  localStorage.removeItem("logineduser");
  window.location.href = "../pages/auth/login.html";
}

// ===== Wishlist Products =====

// Get wishlist IDs for logged in user
const wishlistEntry = ecommerceData["wishlist"].find(
  (w) => w.userId === loggedInUser.id
);
const wishlistProductsId = wishlistEntry ? wishlistEntry.productIds : [];
// Or if it's inside ecommerceData:
const allProductsFromData = ecommerceData["products"] || [];
// Filter products that match the wishlist IDs
const wishlistProducts = allProductsFromData.filter((p) =>
  wishlistProductsId.includes(p.id)
);
// ===== Suggested Products (Dynamic) =====
function getSuggestedProducts(count = 4) {
  const allProducts = ecommerceData["products"] || [];

  // Get logged-in user's wishlist IDs
  const wishlistEntry = ecommerceData["wishlist"].find(
    (w) => w.userId === loggedInUser.id
  ) || { productIds: [] };
  const wishlistIds = wishlistEntry.productIds;

  // Filter out products already in wishlist
  const availableProducts = allProducts.filter(
    (p) => !wishlistIds.includes(p.id)
  );

  // Shuffle products randomly
  const shuffled = availableProducts.sort(() => 0.5 - Math.random());

  // Take the first 'count' products
  return shuffled.slice(0, count);
}

// Now suggestedProducts is dynamic
const suggestedProducts = getSuggestedProducts();

// ===== Render Function =====
function renderProducts(containerId, products, type) {
  const container = document.getElementById(containerId);

  // Get wishlist entry for current user
  const wishlistEntry = ecommerceData["wishlist"].find(
    (w) => w.userId === loggedInUser.id
  ) || { productIds: [] };
  const wishlistIds = wishlistEntry.productIds;

  if (!products.length) {
    container.innerHTML = `<p class="text-muted">No products found in your wishlist.</p>`;
    return;
  }

  container.innerHTML = products
    .map((p) => {
      let iconHTML = "";
      let iconClickHandler = "";

      if (type === "wishlist") {
        // Trash button for wishlist
        iconHTML = `<i class="fas fa-trash"></i>`;
        iconClickHandler = `removeFromWishlist(${p.id})`;
      } else if (type === "suggested") {
        // Heart button for suggested products
        const isInWishlist = wishlistIds.includes(p.id);
        iconHTML = `<i class="${
          isInWishlist ? "text-danger fas" : "far"
        } fa-heart"></i>`;
        iconClickHandler = `toggleWishlist(${p.id})`;
      }

      return `
            <div class="col-lg-3 col-md-6 col-sm-6">
                <div class="product-card" data-id="${p.id}">
                    <div class="product-image position-relative">
                        ${
                          p.discount
                            ? `<span class="sale-badge">${p.discount}%</span>`
                            : ""
                        }
                        ${
                          p.badge
                            ? `<span class="new-badge">${p.badge}</span>`
                            : ""
                        }
                        <button class="${
                          type === "wishlist" ? "wishlist-btn" : "wishlist-btn"
                        }" onclick="event.stopPropagation(); ${iconClickHandler}">
                            ${iconHTML}
                        </button>
                        <img src="../assets/images/products/${
                          p.imageUrl
                        }" alt="${p.name}">
                    </div>
                    <div class="product-info mt-3">
                        <h5 class="product-title">${p.name}</h5>
                        <div class="product-price">
                            ${
                              p.discount
                                ? `<span class="current-price">
                                $${(
                                  p.price -
                                  p.price * (p.discount / 100)
                                ).toFixed(2)}
                              </span> &nbsp;
                              <span class="current-price text-decoration-line-through text-muted">
                                $${p.price.toFixed(2)}
                              </span>
                            `
                                : `
                              <span class="current-price">$${p.price.toFixed(
                                2
                              )}</span>
                            `
                            } 
                        </div>
                        <button data-id="${p.id}" class="add-to-cart">
                                    <i class="fas fa-shopping-cart me-2"></i>
                                    Add To Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}
// product details
document.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (card && !e.target.closest("button")) {
    const productId = card.dataset.id;
    openProduct(productId);
  }
});
// ===== Open product page =====
function openProduct(productId) {
  window.location.href = `productDetails.html?id=${productId}`;
}
// ===== Toggle Wishlist =====
function toggleWishlist(productId) {
  const wishlistEntry = ecommerceData["wishlist"].find(
    (w) => w.userId === loggedInUser.id
  );
  if (!wishlistEntry) {
    // Create new wishlist entry for this user
    ecommerceData["wishlist"].push({
      userId: loggedInUser.id,
      productIds: [productId],
    });
  } else {
    if (wishlistEntry.productIds.includes(productId)) {
      // Remove product
      wishlistEntry.productIds = wishlistEntry.productIds.filter(
        (id) => id !== productId
      );
    } else {
      // Add product
      wishlistEntry.productIds.push(productId);
    }
  }
  // Save to localStorage
  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

  // Re-render suggested products to update heart icons
  renderProducts("suggested-container", suggestedProducts, "suggested");

  // Also refresh wishlist if we're showing it
  const updatedWishlistProducts = (ecommerceData["products"] || []).filter(
    (p) => (wishlistEntry?.productIds || []).includes(p.id)
  );
  renderProducts("wishlist-container", updatedWishlistProducts, "wishlist");
  updateCounters();
}
// ===== Remove from wishlist =====
function removeFromWishlist(productId) {
  // Find wishlist entry for the current user
  const wishlistEntry = ecommerceData["wishlist"].find(
    (w) => w.userId === loggedInUser.id
  );

  if (wishlistEntry) {
    // Remove the product ID
    wishlistEntry.productIds = wishlistEntry.productIds.filter(
      (id) => id !== productId
    );
  }

  // Save updated data to localStorage
  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

  // Rebuild products list from updated IDs
  const updatedWishlistProducts = (ecommerceData["products"] || []).filter(
    (p) => wishlistEntry?.productIds.includes(p.id)
  );

  renderProducts("wishlist-container", updatedWishlistProducts, "wishlist");
  updateCounters();
}
// ===== Add to Cart (with delegation on wishlist container) =====
const wishlistContainer = document.getElementById("wishlist-container");

wishlistContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button.add-to-cart");
  if (!btn) return;
  e.stopPropagation();
  if (!loggedInUser) {
    alert("Please log in to add items to cart");
    return;
  }
  const productId = parseInt(btn.dataset.id);
  let ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || {};
  ecommerceData.cart = Array.isArray(ecommerceData.cart)
    ? ecommerceData.cart
    : [];
  let userCart = ecommerceData.cart.find((c) => c.userId === loggedInUser.id);
  if (!userCart) {
    userCart = { userId: loggedInUser.id, items: [] };
    ecommerceData.cart.push(userCart);
  }
  const existingItem = userCart.items.find((i) => i.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    userCart.items.push({ productId, quantity: 1 });
  }
  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));
  btn.innerHTML = `<i class="fas fa-check me-2"></i> Added`;
  btn.disabled = true;
  updateCounters();
});
const moveAllBtn = document.getElementById("move-all-to-bag");

moveAllBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (!loggedInUser) {
    alert("Please log in to move items to cart");
    return;
  }

  // Get user's wishlist
  const wishlistEntry = ecommerceData["wishlist"].find(
    (w) => w.userId === loggedInUser.id
  );

  if (!wishlistEntry || wishlistEntry.productIds.length === 0) {
    alert("Your wishlist is empty!");
    return;
  }

  // Ensure cart exists
  ecommerceData.cart = Array.isArray(ecommerceData.cart)
    ? ecommerceData.cart
    : [];

  let userCart = ecommerceData.cart.find((c) => c.userId === loggedInUser.id);
  if (!userCart) {
    userCart = { userId: loggedInUser.id, items: [] };
    ecommerceData.cart.push(userCart);
  }

  // Move each product from wishlist into cart
  wishlistEntry.productIds.forEach((productId) => {
    const existingItem = userCart.items.find((i) => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += 1; // increment if already in cart
    } else {
      userCart.items.push({ productId, quantity: 1 });
    }
  });

  // Clear wishlist after moving
  wishlistEntry.productIds = [];

  // Save updates
  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

  // Re-render
  renderProducts("wishlist-container", [], "wishlist");
  renderProducts("suggested-container", suggestedProducts, "suggested");

  // Feedback
  moveAllBtn.innerHTML = `<i class="fas fa-check me-2"></i> Moved!`;
  moveAllBtn.disabled = true;
  updateCounters();
});

// ===== Initial Rendering =====
renderProducts("wishlist-container", wishlistProducts, "wishlist");
renderProducts("suggested-container", suggestedProducts, "suggested");
