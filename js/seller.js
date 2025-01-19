import { Seller } from "./seller/Seller.js";
import { updateHeaderAuthState, updateCartCount, search } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "seller") {
    alert("You do not have permission to access this page.");
    window.location.href = "../html/login.html";
    return;
  }

  // Initialize the seller dashboard
  const seller = new Seller();

  updateHeaderAuthState();
  updateCartCount();

  // Product Search
  document
    .getElementById("searchProductsButton")
    .addEventListener("click", () => {
      search("#searchProductsInput", "#productsTableBody");
    });
  document.getElementById("clearSearchP").addEventListener("click", () => {
    document.querySelector("#searchProductsInput").value = "";
    seller.productManager.fetchProducts();
  });

  // Orders Search
  document
    .getElementById("searchOrdersButton")
    .addEventListener("click", () => {
      search("#searchOrdersInput", "#ordersTableBody");
    });
  document.getElementById("clearSearchO").addEventListener("click", () => {
    document.querySelector("#searchOrdersInput").value = "";
    seller.orderManager.fetchOrders();
  });

  // Rejected Products
  const tableRows = document.querySelectorAll("#productsTableBody tr");
  tableRows.forEach((tr) => {
    let stat = tr.cells[5].textContent;
    if (stat == "rejected") {
      tr.style.textDecoration = "line-through";
      tr.style.color = "red";
    }
  });
});
