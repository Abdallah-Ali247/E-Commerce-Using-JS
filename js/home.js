// import shared function from utils
import {
  updateCartCount,
  addToCart,
  updateHeaderAuthState,
  loginRedirect,
  search,
} from "./utils.js";

// import {searchProducts} from `./products.js`;

// when doc load
document.addEventListener("DOMContentLoaded", () => {
  fetchFeaturedProducts(); // display only featured products
  fetchCategories();       // sipaly category 
  updateHeaderAuthState(); // update header info based on login,logout

  // get current user loged in from local storage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    // if no user logedin then redirect him to login and alert the message
    loginRedirect("#cartCount", "Login to View Carts", "../html/login.html"); // fun at `utils.js`
  }

  // search from home
  const btnSearch = document.querySelector('#btn_search');
  // const inSearch = document.querySelector('#search_input').value.toLowerCase();
  btnSearch.addEventListener('click', ()=>{
    window.location.href='../html/products.html'
    // searchProducts(inSearch);
  });

  updateCartCount(); // update card count
});

// fetch featured products from db
async function fetchFeaturedProducts() {
  const carouselTrack = document.querySelector(".carousel-track"); // carosel container

  try {
    // try to fetch all products
    const response = await fetch("http://localhost:3001/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const products = await response.json();

    // get only fetured products with `True`
    const featuredProducts = products.filter((product) => product.featured);

    // display featured products in the carousel
    displayFeaturedProducts(featuredProducts);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    carouselTrack.innerHTML =
      "<p>Failed to load featured products. Please try again later.</p>";
  }
}

// display featured products in the carousel
function displayFeaturedProducts(products) {
  const carouselTrack = document.querySelector(".carousel-track"); // carousel container

  // clear existing content
  carouselTrack.innerHTML = "";

  // create card for each featured product
  products.forEach((product) => {
    const productCard = document.createElement("div"); // create div
    productCard.className = "product-card"; // add class to the div

    // card content
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <button class="btn" data-product-id="${product.id}">Add to Cart</button>
    `;// `data=product-id` custom data attr

    carouselTrack.appendChild(productCard); // append each card to carousel
  });

  // Add event listeners to "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll(".product-card .btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-product-id");
      addToCart(productId); // add each products card to carts
    });
  });
}

// Carousel navigation
let currentIndex = 0;
// Carousel function
function moveCarousel(direction) {// direction -n or +n 
  const carouselTrack = document.querySelector(".carousel-track");// carousel container
  const productCards = document.querySelectorAll(".product-card");// cards 
  const totalProducts = productCards.length; // get number of cards

  if (totalProducts === 0) return; // No products to display

  const cardWidth = productCards[currentIndex].offsetWidth + 20; // card width + margin

  // update current index using `%` to make sure not to exceeds the length
  currentIndex = (currentIndex + direction + totalProducts) % totalProducts;

  // move the carousel using `transform`
  carouselTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;//move by 1 card width
}

// fetch categories from JSON Server
async function fetchCategories() {
  const categoryGrid = document.querySelector(".category-grid");

  // loading state
  categoryGrid.innerHTML = "<p>Loading categories...</p>";

  try {
    const response = await fetch("http://localhost:3001/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categories = await response.json(); // parse JSON response to obj

    // display categories in the grid
    displayCategories(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    categoryGrid.innerHTML =
      "<p>Failed to load categories. Please try again later.</p>";
  }
}

// display categories in the grid
function displayCategories(categories) {
  const categoryGrid = document.querySelector(".category-grid");

  // clear existing content
  categoryGrid.innerHTML = "";

  // Array of animations
  const animations = ["zoom-out", "fade-up", "flip-left", "fade-right", "slide-up"]; 
  // generate card for each category
  categories.forEach((category) => {
    const categoryCard = document.createElement("a"); // create a link
    categoryCard.className = "category-card"; // add a class 
    categoryCard.href = `../html/products.html`; // set link to products page 

    const anim = Math.round(Math.random()*animations.length)
    // set the `data-aos` attribute js animation
    categoryCard.setAttribute("data-aos", animations[anim]);
    // Set a slower animation duration 1s
    categoryCard.setAttribute("data-aos-duration", "2000");


    // create the card content
    categoryCard.innerHTML = `
      <img src="${category.image}" alt="${category.name}">
      <p>${category.name}</p>
    `;

    // append each card to the grid
    categoryGrid.appendChild(categoryCard);
  });
}

// make it as global function
window.moveCarousel = moveCarousel;
