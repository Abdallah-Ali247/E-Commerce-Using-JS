import { ProductManager } from "./ProductManager.js";
import { OrderManager } from "./OrderManager.js";

export class Seller {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.productManager = new ProductManager(this.currentUser.id);
    this.orderManager = new OrderManager(this.currentUser.id);

    this.initTabs();
    this.initEventListeners();
  }

  // Initialize tabs
  initTabs() {
    const tabs = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs and contents
        tabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        // Add active class to the clicked tab and corresponding content
        tab.classList.add("active");
        const tabId = tab.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");

        // Load data for the selected tab
        if (tabId === "products") {
          this.productManager.fetchProducts();
        } else if (tabId === "orders") {
          this.orderManager.fetchOrders();
        }
      });
    });

    // Load products by default
    this.productManager.fetchProducts();
  }

  // Initialize event listeners
  initEventListeners() {
    document
      .getElementById("addProductButton")
      .addEventListener("click", () => {
        this.productManager.addProduct();
      });
  }
}
