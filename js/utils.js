
// import custom search function 
import { searchWithScore } from "./search/customSearch.js";

// get current user from  local storage
const user = JSON.parse(localStorage.getItem("currentUser"));

// update carts count for each user profile
export function updateCartCount() {
  // get user carts
  const cart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
  // use reduce to calc tatal count (number of products inside carts) 
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  //update cart counts at header
  const cartIcon = document.querySelector("#cartCount");
  if (cartIcon) {
    cartIcon.innerHTML = `<img src="../imgs/home/carts1.png" alt="Cart"> (${cartCount})`;
  }
}

// Add to Cart Function
export function addToCart(productId) {
  // Fetch the product details
  fetch(`http://localhost:3001/products/${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }
      return response.json(); 
    })
    .then((product) => {
      // Get the current cart from localStorage
      let cart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];

      // Check if the product is already in the cart
      const existingProduct = cart.find((item) => item.id === product.id);

      if (existingProduct) {
        // If the product is already in the cart, increase the quantity
        existingProduct.quantity += 1;
      } else {
        // If the product is not in the cart, add it with a quantity of 1
        product.quantity = 1;
        cart.push(product);
      }

      // Save the updated cart back to localStorage
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));

      // Update the cart count in the header
      updateCartCount();

      // Notify the user
      alert(`${product.name} added to cart!`);
    })
    .catch((error) => {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    });
}

// update the header based on user authentication state
export function updateHeaderAuthState() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // get references to DOM elements
  const loginLink = document.getElementById("loginLink"); // login
  const registerLink = document.getElementById("registerLink"); // register
  const userProfile = document.getElementById("userProfile"); // profile link
  const userName = document.getElementById("userName"); // user name
  const logoutButton = document.getElementById("logoutButton"); // logout
  const userPic = document.querySelector(".userProfile a"); // profile pic
  const dashboard = document.getElementById("Dashboard"); // daschboard link

  if (currentUser) { 
    // if user loged inf
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (userProfile) userProfile.style.display = "flex";
    if (userName) userName.textContent = currentUser.name;
    // if (userPic) userPic.textContent = userPic.src;
    if (logoutButton) logoutButton.style.display = "block";

    // change Dashboard link based on user rolle
    if (dashboard) {
      // if a seller loged in set dash link to seller dash
      if (currentUser.role === "seller") {
        // if user at home page there will be diff url
        if (window.location.href.includes("home")) {
          dashboard.firstElementChild.href = "./html/seller.html";
        } else {
          dashboard.firstElementChild.href = "./seller.html";
        }
        // same for admin
      } else if (currentUser.role === "admin") {
        if (window.location.href.includes("home")) {
          dashboard.firstElementChild.href = "./html/admin.html";
        } else {
          dashboard.firstElementChild.href = "./admin.html";
        }
      } else {
        dashboard.style.display = "none";
      }
    }

    // add event listener for logout
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("currentUser"); // remove user from localStorage
        window.location.href = "../home.html"; // redirect to home page
      });
    }
  } else {
    // if NO user is logged in, display login , register
    if (loginLink) loginLink.style.display = "block";
    if (registerLink) registerLink.style.display = "block";
    if (userProfile) userProfile.style.display = "none";
    if (logoutButton) logoutButton.style.display = "none";
    if (dashboard) dashboard.style.display = "none";
  }
}

// redirect function (use it in case anonymous user )
// takes (selector , message , url )
// when click on some thing like (profile) alert (message) redirect to (url)
export function loginRedirect(selector, message, redirectLocation) {
  const clickedElement = document.querySelector(`${selector}`);
  clickedElement.addEventListener("click", (e) => {
    e.preventDefault();
    alert(`${message}`);
    window.location.href = `${redirectLocation}`;
    return;
  });
}



// general dashboard search 
// takes (input selector , dashboard table_id)
export function search(searchId, tableId) {
  // catch value of search input
  const searchInput = document.querySelector(searchId).value.toLowerCase();
  // access all rows 
  const tableRow = document.querySelectorAll(`${tableId} tr`);

  let usersArray = []; // array to store names at second column
  tableRow.forEach((row) => { // for each row append value at second cell to the array
    const name = row.cells[1].textContent.toLowerCase();
    usersArray.push(name); // append each name to the array
  });

  // pass input search and array of names to the `custom search function` 
  let searchResult = searchWithScore(searchInput, usersArray); // return array of words

  // loop on each row & show only matched result 
  tableRow.forEach((row) => {
    const name = row.cells[1].textContent.toLowerCase();
    if (searchResult.includes(name)) {
      row.style.back = "table-row";
      // row.style.backgroundColor = "#ff57228c"
    } else {
      row.style.display = "none";
      // row.style.backgroundColor = "white"
    }
  });
}
