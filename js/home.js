const data = JSON.parse(localStorage.getItem("ecommerceData")) || { products: [] };
    const products = data.products;

    const categories = [...new Set(products.map(p => p.category))];

    const container = document.getElementById("categoriesContainer");

    
    const icons = {
      "Electronics": '<i class="fas fa-mobile me-2"></i>',
      "Men's Fashion": '<i class="fas fa-tshirt me-2"></i>',
      "Women\'s Fashion": '<i class="fas fa-female me-2"></i>',
      "Furniture": '<i class="fas fa-couch me-2"></i>',
      "Toys": '<i class="fas fa-gamepad me-2"></i>'
    };

    const subCategories = {
      "Women's Fashion": ["Dresses", "Shoes", "Accessories"],
      "Electronics": ["Mobiles", "Laptops", "Accessories"]
    };

    function goToCategory(categoryName, subName = "") {
      categoryName = decodeURIComponent(categoryName);
      let url = `../pages/shop.html?category=${encodeURIComponent(categoryName)}`;
      if (subName) url += `&sub=${encodeURIComponent(subName)}`;
      window.location.href = url;
    }


    categories.forEach(cat => {
      const icon = icons[cat] || '<i class="fas fa-tag"></i>';
      container.innerHTML += `
        <div class="mycard" onclick="goToCategory('${encodeURIComponent(cat)}')">
          ${icon}
          <span>${cat}</span>
        </div>
      `;
    });

function renderCarousel(carouselId, items) {
  const carouselInner = document.querySelector(`${carouselId} .carousel-inner`);
  carouselInner.innerHTML = "";

  function getItemsPerSlide() {
    if (window.innerWidth < 576) return 1; 
    if (window.innerWidth < 768) return 2; 
    if (window.innerWidth < 992) return 3; 
    return 4; 
  }

  let itemsPerSlide = getItemsPerSlide();

  for (let i = 0; i < items.length; i += itemsPerSlide) {
    const chunk = items.slice(i, i + itemsPerSlide);
    const activeClass = i === 0 ? "active" : "";
    let cardsHTML = "";

    chunk.forEach(p => {
     cardsHTML += `
  <div class="product-card flex-fill mx-2">
    ${p.discount > 0 ? `<span class="discount">-${p.discount}%</span>` : ""}


    <a class="icons text-dark text-decoration-none" href="../pages/wishlist.html">
      <i class="far fa-heart"></i>
    </a>

    <img src="../assets/images/products/${p.imageUrl}" 
         alt="${p.name}" 
         onerror="this.src='../assets/images/products/placeholder.jpg'">

    <h4>${p.name}</h4>
    <div class="price">
      ${
        p.discount > 0
          ? `
            <span class="old">$${p.price}</span>
            <span class="new">$${(p.price - (p.price * p.discount / 100)).toFixed(2)}</span>
          `
          : `<span class="new">$${p.price}</span>`
      }
    </div>


    <a class="add-to-cart btn" href="../pages/cart.html">
      <i class="fas fa-shopping-cart"></i> Add To Cart
    </a>
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
window.addEventListener("resize", () => {
  renderCarousel("#flashCarousel1", flashSales);
  renderCarousel("#flashCarousel2", bestSelling);
  renderCarousel("#flashCarousel3", newArrivals);
});


function goToProduct(id) {
  window.location.href = `../pages/productDetails.html?id=${id}`;
}


    const flashSales = products.filter(p => p.discount > 0).slice(0, 12);
    const bestSelling = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 12);
  const newArrivals = [...products].slice(-8);

    renderCarousel("#flashCarousel1", flashSales);
    renderCarousel("#flashCarousel2", bestSelling);
        renderCarousel("#flashCarousel3", newArrivals);
function startCountdown(endDate, prefix) {
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = new Date(endDate).getTime() - now;

    if (distance < 0) {
      document.getElementById(`days${prefix}`).textContent = "00";
      document.getElementById(`hours${prefix}`).textContent = "00";
      document.getElementById(`minutes${prefix}`).textContent = "00";
      document.getElementById(`seconds${prefix}`).textContent = "00";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById(`days${prefix}`).textContent = String(days).padStart(2, "0");
    document.getElementById(`hours${prefix}`).textContent = String(hours).padStart(2, "0");
    document.getElementById(`minutes${prefix}`).textContent = String(minutes).padStart(2, "0");
    document.getElementById(`seconds${prefix}`).textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
}

startCountdown("2025-08-23T23:59:59", "Hero");
startCountdown("2025-08-23T23:59:59", "Flash");

  const indicatorsContainer = document.getElementById("carouselIndicators");
  const carouselInner = document.getElementById("carouselInner");


  const featuredProducts = products.slice(0, 6);

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
      <div class="hero-banner" onclick="goToProduct(${product.id})">
        <div class="hero-content">
          <h2>${product.category}</h2>
          <h1>${product.name} - ${product.discount > 0 ? product.discount + "% Off" : "Best Price"}</h1>
          <button class="btn " id="shopnow">Shop Now →</button>
        </div>
        <div class="hero-img">
          <img src="../assets/images/products/${product.imageUrl}" alt="${product.name}">
        </div>
      </div>
    `;

    carouselInner.appendChild(itemDiv);
  });

 function renderRandomCategories(products) {
  const container = document.getElementById("randomCategoriesSection");
  container.innerHTML = "";


  const categories = [...new Set(products.map(p => p.category))];
  const randomCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 4);

  randomCategories.forEach(cat => {

    const catProducts = products.filter(p => p.category === cat);
    const randomProducts = catProducts.sort(() => 0.5 - Math.random()).slice(0, 4);

    let productsHTML = "";
    randomProducts.forEach(p => {
      productsHTML += `
        <a href="../pages/productDetails.html?id=${p.id}" class="product bg-white text-decoration-none text-dark">
          <img src="../assets/images/products/${p.imageUrl}" 
               alt="${p.name}" 
               onerror="this.src='../assets/images/products/placeholder.jpg'">
          <h6>${p.name}</h6>
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


function renderFeaturedGrid(products) {
  
  const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

  const slots = ["one", "two", "three", "four"];
  slots.forEach((slot, index) => {
    const product = randomProducts[index];
    const slotDiv = document.querySelector(`.${slot}`);

    if (product && slotDiv) {
      slotDiv.style.backgroundImage = `url('../assets/images/products/${product.imageUrl}')`;
slotDiv.style.backgroundSize = " auto 80% "; 
slotDiv.style.backgroundPosition = "center";
slotDiv.style.backgroundRepeat = "no-repeat";
slotDiv.style.backgroundPosition = "center";
  slotDiv.style.backgroundRepeat = "no-repeat"; 
  slotDiv.style.cursor = "pointer";

      slotDiv.onclick = () => goToProduct(product.id);
    }
  });
}

renderFeaturedGrid(products);


