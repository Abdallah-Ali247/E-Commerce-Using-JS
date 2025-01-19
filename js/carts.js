// import shared function from utils
import { updateHeaderAuthState, updateCartCount } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  displayCartItems();
  updateCartCount();
  updateHeaderAuthState();
  updateCartCount();

  // Event listener for "Proceed to Checkout" button
  document
    .getElementById("ToCheckout")
    .addEventListener("click", proceedToCheckout);

  // Event listener for "View History" button
  document.getElementById("ToHistory").addEventListener("click", () => {
    window.location.href = "./history.html";
  });
});

// Display cart items
function displayCartItems() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const cartItems = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
  
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalPriceElement = document.getElementById("total-price");

  // Clear existing content
  cartItemsContainer.innerHTML = "";

  let totalPrice = 0;

  // Generate HTML for each cart item
  cartItems.forEach((item, index) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p class='price'>$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-actions" id='${index}'>
          <button class='subPro' >-</button>
          <span>${item.quantity}</span>
          <button class='addPro'>+</button>
          <button class='remPro'>Remove</button>
        </div>
      `;
      // cartItem.setAttribute("data-aos","fade-up-right")

    cartItemsContainer.appendChild(cartItem);

    // Add event listeners for buttons
    const subButton = cartItem.querySelector(".subPro");
    const addButton = cartItem.querySelector(".addPro");
    const removeButton = cartItem.querySelector(".remPro");

    subButton.addEventListener("click", () => {
      updateQuantity(index, -1);
    });

    addButton.addEventListener("click", () => {
      updateQuantity(index, 1);
    });

    removeButton.addEventListener("click", () => {
      removeItem(index);
    });

    // Calculate total price
    totalPrice += item.price * item.quantity;
  });

  // Display total price
  totalPriceElement.textContent = totalPrice.toFixed(2);
}

// Update item quantity
function updateQuantity(index, change) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const cartItems = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];

  // Update quantity
  cartItems[index].quantity += change;

  // Remove item if quantity is 0
  if (cartItems[index].quantity <= 0) {
    cartItems.splice(index, 1);
  }

  // Save updated cart to localStorage
  localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));

  // Refresh cart display
  displayCartItems();
  updateCartCount();
}

// Remove item from cart
function removeItem(index) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const cartItems = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];

  // Remove item
  cartItems.splice(index, 1);

  // Save updated cart to localStorage
  localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));

  // Refresh cart display
  displayCartItems();
  updateCartCount();
}

// Proceed to checkout
async function proceedToCheckout() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const cartItems = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];

  if (cartItems.length === 0) {
    alert("Your cart is empty. Add products before proceeding to checkout.");
    return;
  }

  // Create the order
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const newOrder = {
    customerId: user.id,
    products: cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
    totalAmount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    // Save the order to db.json
    const response = await fetch("http://localhost:3001/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });

    if (!response.ok) throw new Error("Failed to place order.");

    // Clear the cart
    localStorage.removeItem(`cart_${user.id}`);

    alert("Order placed successfully! Status: Pending");
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Failed to place order. Please try again.");
  }
}
