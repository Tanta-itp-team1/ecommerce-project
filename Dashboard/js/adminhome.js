//ecommerce Data
const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
//all main stats
const totalUsers = document.getElementById("totalUsers");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const totalProducts = document.getElementById("totalProducts");
const totalVisitors = document.getElementById("totalVisitors");
const topPage = document.getElementById("topPage");
const topProduct = ecommerceData.products.reduce((max, product) => {
  return product.soldCount > (max?.soldCount || 0) ? product : max;
}, null);
//all substats
const newUsers = document.getElementById("newUsers");
const orderStatus = document.getElementById("orderStatus");
const pendingOrders = ecommerceData.orders.filter(
  (o) => o.status === "pending"
).length;
const completedOrders = ecommerceData.orders.filter(
  (o) => o.status === "Delivered"
).length;
const frozenRevenue = document.getElementById("frozenRevenue");
const availableProducts = document.getElementById("availableProducts");
//assigning to main stats
totalUsers.innerText = ecommerceData.users.length;
totalOrders.innerText = ecommerceData.orders.length;
totalProducts.innerText = ecommerceData.products.length;
totalRevenue.innerText =
  "$" +
  ecommerceData.orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    .toFixed(2);
totalVisitors.innerText = 3250;
//assigning to the substats
newUsers.innerText =
  "+" +
  ecommerceData.users.filter((user) => {
    let createdAt = new Date(user.createdAt || new Date());
    return (
      createdAt >= new Date(new Date().setMonth(new Date().getMonth() - 1))
    );
  }).length +
  " new this month";
orderStatus.innerText = `Pending: ${pendingOrders} | Completed: ${completedOrders}`;
frozenRevenue.innerText = `Frozen: ${
  "$" +
  ecommerceData.orders
    .filter((o) => o.status === "pending")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    .toFixed(2)
}`;
availableProducts.innerText =
  "Available: " + ecommerceData.products.filter((sp) => sp.stock > 0).length;
if (topProduct) {
  topPage.innerHTML = `<a href="../pages/productDetails.html?id=${topProduct.id}" class="text-white">${topProduct.name}</a>`;
} else {
  topPage.innerText = "N/A";
}
// second section charts
window.addEventListener("load", function () {
  const salesByMonth = Array(12).fill(0); // Jan to Dec
  const orders = ecommerceData.orders || [];
  orders.forEach((order) => {
    if (order.orderDate && order.totalAmount) {
      const monthIndex = new Date(order.orderDate).getMonth(); // 0 = Jan
      salesByMonth[monthIndex] += order.totalAmount;
    }
  });

  // Labels for months
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // --- Sales Overview (Line Chart) ---
  const ctxSales = document.getElementById("salesChart").getContext("2d");
  new Chart(ctxSales, {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "Sales ($)",
          data: salesByMonth,
          fill: true,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#4bc0c0",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Sales Overview",
        },
      },
    },
  });

  // --- Orders by Status (Pie Chart) ---
  const ctxOrders = document
    .getElementById("ordersStatusChart")
    .getContext("2d");
  new Chart(ctxOrders, {
    type: "pie",
    data: {
      labels: ["Pending", "delivered", "Cancelled"],
      datasets: [
        {
          label: "Orders",
          data: [
            pendingOrders,
            completedOrders,
            ecommerceData.orders.filter((o) => o.status === "canceled").length,
          ],
          backgroundColor: [
            "rgba(255, 205, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(255, 99, 132, 0.7)",
          ],
          borderColor: [
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Orders by Status",
        },
      },
    },
  });
  // Fill Recent Orders
  const recentOrdersTable = document.getElementById("recentOrdersTable");
  recentOrdersTable.innerHTML = orders
    .slice(-5) // Last 5 orders
    .reverse() // Show newest first
    .map(
      (order) => `
        <tr>
            <td>#${order.orderId}</td>
            <td>${
              ecommerceData.users.find((u) => u.id == order.userId).name ||
              "N/A"
            }</td>
            <td>$${order.totalAmount?.toFixed(2) || "0.00"}</td>
            <td><span class="badge bg-${
              order.status === "Delivered"
                ? "success"
                : order.status === "Pending"
                ? "warning"
                : order.status === "Canceled"
                ? "danger"
                : "secondary"
            }">${order.status}</span></td>
            <td>${order.orderDate || "N/A"}</td>
        </tr>
    `
    )
    .join("");

  // Fill New Users
  const users = ecommerceData.users || [];
  const newUsersList = document.getElementById("newUsersList");
  newUsersList.innerHTML = users
    .slice(-5) // Last 5 registered
    .reverse()
    .map(
      (user) => `
        <li class="list-group-item d-flex align-items-center">
            <img src="${
              user.img ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random`
            }" alt="Avatar" class="rounded-circle me-2" width="40" height="40">
            <div>
                <div>${user.name}</div>
                <small class="text-muted">${user.email}</small>
            </div>
        </li>
    `
    )
    .join("");
  // Top products and low stock alert
  const products = ecommerceData.products || [];
  const topProductsList = document.getElementById("topProductsList");
  const lowStockList = document.getElementById("lowStockList");
  // Function to render list items
  const renderList = (
    element,
    items,
    emptyText,
    badgeKey,
    badgeClass,
    headers
  ) => {
    element.innerHTML = ""; // Clear old content
    if (items.length === 0) {
      element.innerHTML = `<li class="list-group-item">${emptyText}</li>`;
      return;
    }
    // Add headers if provided
    if (headers) {
      element.innerHTML += `
        <li class="list-group-item fw-bold d-flex justify-content-between">
          <span>ID </span>
          <span>${headers[0]}</span>
          <span>${headers[1]}</span>
        </li>
      `;
    }
    // Add product rows
    items.forEach((p) => {
      element.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${p.id} </span>
          <div class="d-flex align-items-center">
            <img src="../../assets/images/products/${p.imageUrl}" alt="${p.name}" width="40" height="40" class="me-2 rounded">
            ${p.name}
          </div>
          <span class="badge ${badgeClass} rounded-pill">${p[badgeKey]}</span>
        </li>
      `;
    });
  };

  // Top Selling Products
  const topSelling = [...products]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 5);
  renderList(
    topProductsList,
    topSelling,
    "No top products yet",
    "soldCount",
    "bg-success",
    ["Product", "Sold"]
  );

  // Low Stock Alerts
  const lowStock = products.filter((p) => (p.stock || 0) <= 5);
  renderList(
    lowStockList,
    lowStock,
    "No low stock items",
    "stock",
    "bg-danger",
    ["Product", "Stock Left"]
  );
});
