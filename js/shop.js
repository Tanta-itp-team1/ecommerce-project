const categoryContainer =
  document.getElementsByClassName("category-buttons")[0];
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
    (w) => w.userId == loggedInUser.id
  )?.productIds || [];
let currentProducts = [...ShopProducts];
let pagginationArr=currentProducts.slice(0,12);
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
                                    <button class="add-to-cart" onclick="addToCart(${p.id},1)">
                                        <i class="fas fa-shopping-cart me-2"></i>
                                        Add To Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
  }
}
const pagginationArea=document.getElementById('pagginationId');
const pageNumbers=Math.ceil(currentProducts.length/12); 
let pages =Array.from({ length: pageNumbers }, (_, i) => i + 1);
function renderPaggination(){
  for(let i=0;pages.length>i;i++){
    pagginationArea.innerHTML+=`<li><a onclick="paggination(${pages[i]},event)" class=${pages[i]==1?"active":""}  >${pages[i]}</a></li>`
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
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
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
  window.location.href = "productDetails.html";
}
function addToCart(productId, quantity) {
  // Get ecommerce data from localStorage or initialize it
  let data = JSON.parse(localStorage.getItem("ecommerceData")) || { cart: [] };

  // Find the logged in user ID (replace with your actual variable)
  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")); 
  if (!loggedInUser || !loggedInUser.id) {
    alert("You must be logged in to add items to the cart.");
    return;
  }

  // Find the user's cart
  let userCart = data.cart.find(c => c.userId === loggedInUser.id);

  // If no cart exists for this user, create one
  if (!userCart) {
    userCart = { userId: loggedInUser.id, items: [] };
    data.cart.push(userCart);
  }

  // Check if product is already in cart
  let existingItem = userCart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity; // Increment quantity
    showToast("+1 Item Added","success");
  } else {
    userCart.items.push({ productId, quantity }); // Add new product
    showToast("Item Added Successfully To Cart","success");
  }

  // Save back to localStorage
  localStorage.setItem("ecommerceData", JSON.stringify(data));

  console.log(`Product ${productId} added to cart. Current cart:, userCart.items`);
}
function showToast(message, type = "danger") {
    let toastEl = document.getElementById("toastMessage");

    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    
    toastEl.querySelector(".toast-body").textContent = message;

    let toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function paggination(pageNum,event){
  let startIndex;
  let endIndex;
  let pagginationIcons = document.querySelectorAll(".pagination>li>a.active");
  console.log(pagginationIcons);
    if(pagginationIcons.length>0){
      pagginationIcons[0].className="";
    }
  startIndex=(pageNum-1)*12;
  endIndex=startIndex+12;
  pagginationArr=currentProducts.slice(startIndex,endIndex);
  event.target.className="active";
  renderProducts(pagginationArr);
  window.scrollTo(top);
}

renderProducts(pagginationArr);
renderPaggination();
