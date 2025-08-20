
const data = JSON.parse(localStorage.getItem("ecommerceData")) || { products: [] };
const products = Array.isArray(data.products) ? data.products : [];
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlistEntry = data.wishlist.find(w => w.userId === loggedInUser?.id);
if (!wishlistEntry) {
  wishlistEntry = { userId: loggedInUser?.id, productIds: [] };
  data.wishlist.push(wishlistEntry);
}
let userCart = data.cart.find(c => c.userId === loggedInUser?.id);
if (!userCart) {
  userCart = { userId: loggedInUser?.id, items: [] };
  data.cart.push(userCart);
}
function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #000; color: #fff; padding: 8px 14px; border-radius: 8px;
    z-index: 3000; opacity: 0.95; font-size: 14px;`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1200);
}
function updateCounts() {
  const favEl = document.getElementById("favCount");
  const cartEl = document.getElementById("cartCount");

  if (favEl) favEl.textContent = wishlistEntry.productIds.length;
  if (cartEl) {
    const total = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
    cartEl.textContent = total;
  }
}




function addToCart(productId) {
  const existingItem = userCart.items.find(i => i.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    toast("➕ Increased quantity in cart");
  } else {
    userCart.items.push({ productId, quantity: 1 });
    toast("✅ Added to cart");
  }

  localStorage.setItem("ecommerceData", JSON.stringify(data));
  updateCounts();
}


function toggleFavorite(productId, btn) {
  const idx = wishlistEntry.productIds.indexOf(productId);

  if (idx > -1) {
    wishlistEntry.productIds.splice(idx, 1);
    toast("❌ Removed from wishlist");
  } else {
    wishlistEntry.productIds.push(productId);
    toast("❤️ Added to wishlist");
  }

  localStorage.setItem("ecommerceData", JSON.stringify(data));
  updateCounts();

  if (btn) {
    const icon = btn.querySelector("i");
    if (icon) {
      const isFav = wishlistEntry.productIds.includes(productId);
      icon.classList.toggle("fas", isFav);
      icon.classList.toggle("far", !isFav);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateCounts();


  const categories = [...new Set(JSON.parse(localStorage.getItem("ecommerceData")).categories)];
  const categoriesContainer = document.getElementById("categoriesContainer");

  const icons = {
    "Electronics": '<i class="fas fa-mobile me-2"></i>',
    "Men\'s Fashion": '<i class="fas fa-tshirt me-2"></i>',
    "Women\'s Fashion": '<i class="fas fa-female me-2"></i>',
    "Furniture": '<i class="fas fa-couch me-2"></i>',
    "Toys": '<i class="fas fa-gamepad me-2"></i>'
  };

  const subCategories = {
    "Women\'s Fashion": ["Dresses", "Shoes", "Accessories"],
    "Electronics": ["Mobiles", "Laptops", "Accessories"]
  };

  function goToCategory(categoryName, subName = "") {
    categoryName = decodeURIComponent(categoryName);
    let url = `../pages/shop.html?category=${encodeURIComponent(categoryName)}`;
    if (subName) url += `&sub=${encodeURIComponent(subName)}`;
    window.location.href = url;
  }

  if (categoriesContainer) {
    categories.forEach(cat => {
      const icon = icons[cat] || '<i class="fas fa-tag"></i>';
      categoriesContainer.innerHTML += `
        <div class="mycard" onclick="goToCategory('${encodeURIComponent(cat)}')">
          ${icon}
          <span>${cat}</span>
        </div>
      `;
    });
  }


  function renderCarousel(carouselId, items) {
    const carouselInner = document.querySelector(`${carouselId} .carousel-inner`);
    if (!carouselInner) return;
    carouselInner.innerHTML = "";

    function getItemsPerSlide() {
      if (window.innerWidth < 576) return 1;
      if (window.innerWidth < 768) return 2;
      if (window.innerWidth < 992) return 3;
      return 4;
    }

    const itemsPerSlide = getItemsPerSlide();

    for (let i = 0; i < items.length; i += itemsPerSlide) {
      const chunk = items.slice(i, i + itemsPerSlide);
      const activeClass = i === 0 ? "active" : "";
      let cardsHTML = "";

      chunk.forEach(p => {
        const hasDiscount = Number(p.discount) > 0;
        const priceNow = hasDiscount
          ? (p.price - (p.price * p.discount / 100)).toFixed(2)
          : p.price;

const isFav = wishlistEntry.productIds.includes(p.id);

        cardsHTML += `
          <div class="product-card flex-fill mx-2">
            ${hasDiscount ? `<span class="discount">-${p.discount}%</span>` : ""}


            <button class="icons text-dark btn p-0" onclick="toggleFavorite(${p.id}, this)" title="Wishlist">
              <i class="${isFav ? "fas" : "far"} fa-heart"></i>
            </button>

            <img src="../assets/images/products/${p.imageUrl}"
                 alt="${p.name}"
                 onerror="this.src='../assets/images/products/placeholder.jpg'">

            <h4>${p.name}</h4>
            <div class="price">
              ${
                hasDiscount
                  ? `<span class="old">$${p.price}</span>
                     <span class="new">$${priceNow}</span>`
                  : `<span class="new">$${p.price}</span>`
              }
            </div>

            <!-- كارت -->
            <button class="add-to-cart btn" onclick="addToCart(${p.id})">
              <i class="fas fa-shopping-cart"></i> Add To Cart
            </button>
          </div>
        `;
      });

      carouselInner.innerHTML += `
        <div class="carousel-item ${activeClass}">
          <div class="d-flex justify-content-center">
            ${cardsHTML}
          </div>
        </div>
      `;
    }
  }

  function goToProduct(id) {
    window.location.href = `../pages/productDetails.html?id=${id}`;
  }

  const flashSales = products.filter(p => Number(p.discount) > 0).slice(0, 12);
  const bestSelling = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 12);
  const newArrivals = [...products].slice(-8);

  renderCarousel("#flashCarousel1", flashSales);
  renderCarousel("#flashCarousel2", bestSelling);
  renderCarousel("#flashCarousel3", newArrivals);


  window.addEventListener("resize", () => {
    renderCarousel("#flashCarousel1", flashSales);
    renderCarousel("#flashCarousel2", bestSelling);
    renderCarousel("#flashCarousel3", newArrivals);
  });


  function startCountdown(endDate, prefix) {
    function updateCountdown() {
      const now = Date.now();
      const distance = new Date(endDate).getTime() - now;

      const set = v => String(v).padStart(2, "0");
      const daysEl = document.getElementById(`days${prefix}`);
      const hoursEl = document.getElementById(`hours${prefix}`);
      const minutesEl = document.getElementById(`minutes${prefix}`);
      const secondsEl = document.getElementById(`seconds${prefix}`);

      if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

      if (distance < 0) {
        daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = "00";
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = set(days);
      hoursEl.textContent = set(hours);
      minutesEl.textContent = set(minutes);
      secondsEl.textContent = set(seconds);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
  }

  startCountdown("2025-08-23T23:59:59", "Hero");
  startCountdown("2025-08-23T23:59:59", "Flash");


  const indicatorsContainer = document.getElementById("carouselIndicators");
  const landingCarouselInner = document.getElementById("carouselInner");
  const featuredProducts = products.slice(0, 6);

  if (indicatorsContainer && landingCarouselInner) {
    featuredProducts.forEach((product, index) => {
      const indicatorBtn = document.createElement("button");
      indicatorBtn.type = "button";
      indicatorBtn.setAttribute("data-bs-target", "#landingCarousel");
      indicatorBtn.setAttribute("data-bs-slide-to", index);
      if (index === 0) indicatorBtn.classList.add("active");
      indicatorsContainer.appendChild(indicatorBtn);

      const itemDiv = document.createElement("div");
      itemDiv.className = `carousel-item ${index === 0 ? "active" : ""}`;
      itemDiv.innerHTML = `
        <div class="hero-banner" onclick="window.location.href='../pages/productDetails.html?id=${product.id}'">
          <div class="hero-content">
            <h2>${product.category}</h2>
            <h1>${product.name} - ${Number(product.discount) > 0 ? product.discount + "% Off" : "Best Price"}</h1>
            <button class="btn" id="shopnow">Shop Now →</button>
          </div>
          <div class="hero-img">
            <img src="../assets/images/products/${product.imageUrl}" alt="${product.name}">
          </div>
        </div>
      `;
      landingCarouselInner.appendChild(itemDiv);
    });
  }


  function renderRandomCategories(list) {
    const container = document.getElementById("randomCategoriesSection");
    if (!container) return;
    container.innerHTML = "";

    const cats = [...new Set(list.map(p => p.category))];
    const randomCategories = cats.sort(() => 0.5 - Math.random()).slice(0, 4);

    randomCategories.forEach(cat => {
      const catProducts = list.filter(p => p.category === cat);
      const randomProducts = catProducts.sort(() => 0.5 - Math.random()).slice(0, 4);

      let productsHTML = "";
      randomProducts.forEach(p => {
        productsHTML += `
          <a href="../pages/productDetails.html?id=${p.id}" class="product bg-white text-decoration-none text-dark">
            <img src="../assets/images/products/${p.imageUrl}"
                 alt="${p.name}"
                 onerror="this.src='../assets/images/products/placeholder.jpg'">
            <p>${p.name}</p>
            <p class="mb-1 fw-bold">$${p.price}</p>
          </a>
        `;
      });

      container.innerHTML += `
        <div class="col-12 col-md-6 col-lg-3">
          <div class="category-card">
            <h3>${cat}</h3>
            <div class="products-grid">
              ${productsHTML}
            </div>
          </div>
        </div>
      `;
    });
  }
  renderRandomCategories(products);


  function renderFeaturedGrid(list) {
    const randomProducts = [...list].sort(() => 0.5 - Math.random()).slice(0, 4);
    const slots = ["one", "two", "three", "four"];

    slots.forEach((slot, index) => {
      const product = randomProducts[index];
      const slotDiv = document.querySelector(`.${slot}`);
      if (product && slotDiv) {
        slotDiv.style.backgroundImage = `url('../assets/images/products/${product.imageUrl}')`;
        slotDiv.style.backgroundSize = "auto 80%";
        slotDiv.style.backgroundPosition = "center";
        slotDiv.style.backgroundRepeat = "no-repeat";
        slotDiv.style.cursor = "pointer";
        slotDiv.onclick = () => (window.location.href = `../pages/productDetails.html?id=${product.id}`);
      }
    });
  }
  renderFeaturedGrid(products);

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", function () {
      const query = this.value.trim().toLowerCase();
      searchResults.innerHTML = "";
      if (!query) {
        searchResults.style.display = "none";
        return;
      }

      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
      );

      if (filtered.length === 0) {
        searchResults.innerHTML = `<p class="p-2 m-0 text-muted">No results found</p>`;
        searchResults.style.display = "block";
        return;
      }

      filtered.forEach(p => {
        const item = document.createElement("div");
        item.className = "d-flex align-items-center p-2 border-bottom search-item";
        item.style.cursor = "pointer";
        item.innerHTML = `
          <img src="../assets/images/products/${p.imageUrl}"
               onerror="this.src='../assets/images/products/placeholder.jpg'"
               alt="${p.name}"
               style="width:40px; height:40px; object-fit:cover; margin-right:10px; border-radius:5px;">
          <div>
            <div class="fw-bold">${p.name}</div>
            <small class="text-muted">$${p.price}</small>
          </div>
        `;
        item.addEventListener("click", () => {
          window.location.href = `../pages/productDetails.html?id=${p.id}`;
        });
        searchResults.appendChild(item);
      });

      searchResults.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.style.display = "none";
      }
    });
  }
});