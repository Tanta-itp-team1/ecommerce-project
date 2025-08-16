const categoryContainer = document.getElementsByClassName("category-buttons")[0];
const productsContainer = document.getElementById("shop-container");
const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
const categories = [];
ecommerceData.products.forEach((p) => {
  if (!categories.includes(p.category)) {
    categories.push(p.category);
  }
});
categoryContainer.innerHTML = `<button class="category-btn active" onclick="filterByCategory('all', this)">All Products</button>`;
// Add category buttons dynamically
categories.forEach((category) => {
  const btn = document.createElement("button");
  btn.className = "category-btn";
  btn.textContent = category;
  btn.addEventListener("click", function () {
    filterByCategory(category, btn);
  });
  categoryContainer.appendChild(btn);
});
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || [];
const ShopProducts = JSON.parse(localStorage.getItem("ecommerceData")).products;
let WishlistProducts =
  JSON.parse(localStorage.getItem("ecommerceData")).wishlist.find(
    (w) => (w.userId == loggedInUser.id)
  )?.productIds || [];
let currentProducts = [...ShopProducts];
let currentCategory = "all";
let currentSort = "default";
function renderProducts(products) {
  const container = document.getElementById("shop-container");
  container.innerHTML = "";
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    container.innerHTML += `
                        <div class="col-lg-3 col-md-6 col-sm-6">
                            <div class="product-card">
                                <div class="product-image">
                                    ${
                                      p.discount
                                        ? `<span class="sale-badge">${p.discount}%</span>`
                                        : ""
                                    }
                                    <button class="Shop-btn" onclick="copyToWishlist(${
                                      p.id
                                    })">
                                        <i id="heart-${p.id}" class="${
      checkWishlist(p.id) ? "fa-solid fa-heart redHeart" : "fa-regular fa-heart"
    }"></i>
                                    </button>
                                    <button class="view-btn">
                                        <i class="fas fa-eye" onclick="goToProductDetails(${i})"></i>
                                    </button>
                                    <img src="../assets/images/products/${
                                      p.imageUrl
                                    }" alt="${p.name}">
                                </div>
                                <div class="product-info">
                                    <h5 class="product-title">${p.name}</h5>
                                    <div class="product-price">
                                        <span class="current-price ${
                                          p.discount
                                            ? "text-decoration-line-through small text-black"
                                            : ""
                                        }">${p.price}</span>&nbsp;
                                        <span class="current-price ${
                                          !p.discount ? "d-none" : ""
                                        }"> $${
      p.discount ? p.price - p.price * (p.discount / 100) : p.price
    }</span>
                                    </div>
                                    <button class="add-to-cart" onclick="addToCart()">
                                        <i class="fas fa-shopping-cart me-2"></i>
                                        Add To Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
  }
}
function filterByCategory(category, btnElement) {
  currentCategory = category;
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  btnElement.classList.add("active");
  if (category === "all") {
    currentProducts = [...ShopProducts];
  } else {
    currentProducts = ShopProducts.filter(
      (product) => product.category === category
    );
  }
  renderProducts(currentProducts);
}

function toggleFilters() {
  const filtersSection = document.getElementById("filtersSection");
  filtersSection.classList.toggle("show");
}
function toggleSearch() {
  const searchBox = document.getElementById("searchBox");
  searchBox.classList.toggle("show");

  if (searchBox.classList.contains("show")) {
    document.getElementById("searchInput").focus();
  }
}

function searchProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let productsToSearch =
    currentCategory === "all"
      ? ShopProducts
      : ShopProducts.filter((product) => product.category === currentCategory);

  if (searchTerm === "") {
    currentProducts = productsToSearch;
  } else {
    currentProducts = productsToSearch.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  renderProducts(currentProducts);
}

function sortProducts(sortType) {
  currentSort = sortType;

  document
    .querySelectorAll(".filter-group .filter-option")
    .forEach((option) => {
      option.classList.remove("active");
    });
  event.target.classList.add("active");

  let sortedProducts = [...currentProducts];

  switch (sortType) {
    case "price-low":
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case "name":
      sortedProducts.sort((a, b) => a.name.localeCompare(b.title));
      break;
    default:
      break;
  }

  currentProducts = sortedProducts;
  renderProducts(currentProducts);
}

function filterByPrice() {
  const minPrice = document.getElementById("minPrice").value || 0;
  const maxPrice = document.getElementById("maxPrice").value || 999999;

  let productsToFilter =
    currentCategory === "all"
      ? ShopProducts
      : ShopProducts.filter((product) => product.category === currentCategory);

  currentProducts = productsToFilter.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );

  renderProducts(currentProducts);
}

function setPriceRange(min, max) {
  document.getElementById("minPrice").value = min;
  document.getElementById("maxPrice").value = max;
  filterByPrice();
}

function copyToWishlist(productId) {
  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const userWishlist = ecommerceData.wishlist.find(
    (w) => w.userId === loggedInUser.id
  );
  let inWishlist = false;

  if (!userWishlist) {
    ecommerceData.wishlist.push({
      userId: loggedInUser.id,
      productIds: [productId],
    });
    inWishlist = true;
  } else {
    const existIndex = userWishlist.productIds.findIndex(
      (id) => id === productId
    );
    if (existIndex === -1) {
      userWishlist.productIds.push(productId);
      inWishlist = true;
    } else {
      userWishlist.productIds.splice(existIndex, 1);
      inWishlist = false;
    }
  }

  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

  // Change the heart icon directly
  const heartIcon = document.querySelector(`#heart-${productId}`);
  if (inWishlist) {
    heartIcon.className = "fa-solid fa-heart redHeart";
  } else {
    heartIcon.className = "fa-regular fa-heart";
  }
}

function checkWishlist(productID) {
  return WishlistProducts.some((product) => product === productID);
}

function goToProductDetails(index) {
  window.location.href = "test.html";
}

renderProducts(ShopProducts);