import { updateCartCount, addToCart, updateHeaderAuthState } from "./utils.js";
import { searchWithScore } from "./search/customSearch.js";

document.addEventListener("DOMContentLoaded", () => {
  fetchCategories(); // Fetch and display categories
  fetchProducts(); // Fetch and display all products
  updateHeaderAuthState(); // handle user login info
  const btnSearch = document.querySelector("#btn_search");
  btnSearch.addEventListener("click", () => {
    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");

    minPrice.value = minPrice.value ? "" : minPrice.value;
    maxPrice.value = maxPrice.value ? "" : maxPrice.value;
    searchProducts(); // seearch Function
  });

  const btnFilter = document.querySelector("#btn_price_filter");
  btnFilter.addEventListener("click", () => {
    const inputSearch = document.getElementById("search_input");
    inputSearch.value = inputSearch.value ? "" : inputSearch.value;

    filterProductsByPrice();
  });

  updateCartCount(); // Update cart count on page load
});

// Fetch categories from JSON Server
async function fetchCategories() {
  const categoryButtons = document.querySelector(".category-buttons");

  try {
    const response = await fetch("http://localhost:3001/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categories = await response.json();

    // Display category buttons
    displayCategoryButtons(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    categoryButtons.innerHTML =
      "<p>Failed to load categories. Please try again later.</p>";
  }
}

// Display category buttons
function displayCategoryButtons(categories) {
  const categoryButtons = document.querySelector(".category-buttons");

  // Clear existing content
  categoryButtons.innerHTML = "";

  // Add an "All" button to show all products
  const allButton = document.createElement("button");
  allButton.textContent = "All";
  allButton.classList.add("active"); // Set "All" as the default active button
  allButton.addEventListener("click", () => {
    fetchProducts(); // Show all products
    setActiveButton(allButton);
  });
  categoryButtons.appendChild(allButton);

  // Add buttons for each category
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.addEventListener("click", () => {
      // reset all filters for each click on category button
      const minPrice = document.getElementById("min-price");
      const maxPrice = document.getElementById("max-price");
      const inputSearch = document.getElementById("search_input");
      minPrice.value = minPrice.value ? "" : minPrice.value;
      maxPrice.value = maxPrice.value ? "" : maxPrice.value;
      inputSearch.value = inputSearch.value ? "" : inputSearch.value;

      filterProductsByCategory(category.name); // Filter products by category
      setActiveButton(button);
    });
    categoryButtons.appendChild(button);
  });
}

// Set the active category button
function setActiveButton(activeButton) {
  const buttons = document.querySelectorAll(".category-buttons button");
  buttons.forEach((button) => button.classList.remove("active"));
  activeButton.classList.add("active");
}

// Fetch products from JSON Server
async function fetchProducts() {
  const productGrid = document.querySelector(".product-grid");

  // Show loading state
  productGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const response = await fetch("http://localhost:3001/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const products = await response.json();

    // Display all products
    displayProducts(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    productGrid.innerHTML =
      "<p>Failed to load products. Please try again later.</p>";
  }
}

// Filter products by category
async function filterProductsByCategory(categoryName) {
  const productGrid = document.querySelector(".product-grid");

  // Show loading state
  productGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const response = await fetch("http://localhost:3001/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const products = await response.json();

    // Filter products by category
    const filteredProducts = products.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    );

    // Display filtered products
    displayProducts(filteredProducts, categoryName);
  } catch (error) {
    console.error("Error filtering products:", error);
    productGrid.innerHTML =
      "<p>Failed to load products. Please try again later.</p>";
  }
}

// Display products in the grid
function displayProducts(allProducts, categoryName) {
  const productGrid = document.querySelector(".product-grid");
  const catTitle = document.querySelector("#cat_title");

  // Filter the products by status
  const products = allProducts.filter(
    (product) => product.status === "approved"
  );

  // Update the h1 title of content
  categoryName = categoryName ? categoryName : "All";
  catTitle.innerHTML = `${categoryName} Products`;

  // Clear existing content
  productGrid.innerHTML = "";

  // Generate HTML for each product
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <button class="btn" data-product-id="${product.id}">Add to Cart</button>
    `;

    productGrid.appendChild(productCard);

  });

  // Add event listeners to "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll(".product-card .btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-product-id");
      addToCart(productId);
    });
  });
}

// Filter products by price range
function filterProductsByPrice() {
  const minPrice = Number(document.getElementById("min-price").value) || 0;
  const maxPrice =
    Number(document.getElementById("max-price").value) || Infinity;

  //const productGrid = document.querySelector('.product-grid');

  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    let price = Number(card.querySelector("p").textContent.slice(1));

    if (price >= minPrice && price <= maxPrice) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Search products by name
function searchProducts() {
  const searchInput = document
    .querySelector("#search_input")
    .value.toLocaleLowerCase();
  const productCards = document.querySelectorAll(".product-card");

  let productsArray = []; // Array to store all product names
  productCards.forEach((card) => {
    const productName = card.querySelector("h3").textContent.toLowerCase();
    productsArray.push(productName); // Append each name to the array
  });

  let searchResult = searchWithScore(searchInput, productsArray); // Use search function

  productCards.forEach((card) => {
    const productName = card.querySelector("h3").textContent.toLowerCase();
    if (searchResult.includes(productName)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Export functions
export { filterProductsByPrice, searchProducts };
