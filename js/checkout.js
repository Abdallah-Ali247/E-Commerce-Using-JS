import { updateHeaderAuthState, updateCartCount } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("You need to log in to access this page.");
    window.location.href = "../html/login.html";
    return;
  }
  updateHeaderAuthState();
  updateCartCount();

  // Retrieve the cart data from localStorage
  const cartItems = JSON.parse(localStorage.getItem("checkoutCart")) || [];
  if (cartItems.length === 0) {
    alert("Your cart is empty. Add products before proceeding to checkout.");
    window.location.href = "../html/products.html"; // Redirect to products page
    return;
  }

  // Display the cart summary
  displayCartSummary(cartItems);

  // Handle the "Place Order" button click
  document
    .getElementById("placeOrderButton")
    .addEventListener("click", () => placeOrder(cartItems, currentUser.id));
});

// Display the cart summary
function displayCartSummary(cartItems) {
  const checkoutSummary = document.querySelector(".checkout-summary");
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  checkoutSummary.innerHTML = `
      <p>Total: $<span id="total-price">${totalPrice.toFixed(2)}</span></p>
    `;
}

// Place the order
async function placeOrder(cartItems, customerId) {
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const newOrder = {
    customerId,
    products: cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
    totalAmount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await fetch("http://localhost:3001/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });

    if (!response.ok) throw new Error("Failed to place order.");

    // Clear the cart and checkout data after placing the order
    localStorage.removeItem(`cart_${customerId}`);
    localStorage.removeItem("checkoutCart");
    alert("Order placed successfully!");
    window.location.href = "../html/orders.html"; // Redirect to orders page
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Failed to place order. Please try again.");
  }
}
