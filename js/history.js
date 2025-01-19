import { updateHeaderAuthState, updateCartCount } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("You need to log in to view your order history.");
    window.location.href = "../html/login.html";
    return;
  }
  updateHeaderAuthState();
  updateCartCount();

  fetchOrderHistory(currentUser.id);
});

async function fetchOrderHistory(customerId) {
  try {
    console.log("Fetching orders for customer:", customerId);

    // Convert customerId to a number (if necessary)
    customerId = Number(customerId);

    // Fetch orders for the customer
    const ordersResponse = await fetch(
      `http://localhost:3001/orders?customerId=${customerId}`
    );
    if (!ordersResponse.ok)
      throw new Error(
        `Failed to fetch order history. Status: ${ordersResponse.status}`
      );
    const orders = await ordersResponse.json();
    console.log("Orders:", orders);

    // Fetch products for product details
    const productsResponse = await fetch("http://localhost:3001/products");
    if (!productsResponse.ok)
      throw new Error(
        `Failed to fetch products. Status: ${productsResponse.status}`
      );
    const products = await productsResponse.json();
    console.log("Products:", products);

    // Fetch reviews for the customer
    const reviewsResponse = await fetch("http://localhost:3001/reviews");
    if (!reviewsResponse.ok)
      throw new Error(
        `Failed to fetch reviews. Status: ${reviewsResponse.status}`
      );
    const reviews = await reviewsResponse.json();
    console.log("Reviews:", reviews);

    // Display the order history
    displayOrderHistory(orders, products, reviews);
  } catch (error) {
    console.error("Error fetching order history:", error.message || error);
    alert("Failed to load order history. Please try again later.");
  }
}

function displayOrderHistory(orders, products, reviews) {
  const orderList = document.getElementById("orderList");

  if (orders.length === 0) {
    orderList.innerHTML = "<p>No orders found.</p>";
    return;
  }

  console.log("Displaying orders:", orders);
  console.log("Available products:", products);
  console.log("Available reviews:", reviews);

  orderList.innerHTML = orders
    .map(
      (order) => `
      <div class="order-container">
        <div class="order-header">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
          <p><strong>Date:</strong> ${new Date(
            order.createdAt
          ).toLocaleDateString()}</p>
        </div>
        <div class="product-list">
          ${order.products
            .map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) {
                console.error("Product not found for item:", item);
                return ""; // Skip this product
              }

              // Check if a review exists for this product in this order
              const review = reviews.find(
                (r) => r.orderId === order.id && r.productId === product.id
              );

              return `
              <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-details">
                  <p><strong>Name:</strong> ${product.name}</p>
                  <p><strong>Quantity:</strong> ${item.quantity}</p>
                  <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                  ${
                    order.status === "delivered"
                      ? review
                        ? `
                      <div class="submitted-review">
                        <p><strong>Rating:</strong> ${review.rating} / 5</p>
                        <p><strong>Comment:</strong> ${review.comment}</p>
                      </div>
                    `
                        : `
                      <form class="review-form" data-order-id="${order.id}" data-product-id="${product.id}">
                        <label for="rating">Rating:</label>
                        <input type="number" id="rating" name="rating" min="1" max="5" required>
                        <label for="comment">Comment:</label>
                        <textarea id="comment" name="comment" rows="3" required></textarea>
                        <button type="submit">Submit Review</button>
                      </form>
                    `
                      : ""
                  }
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `
    )
    .join("");

  // Add event listeners for review forms
  document.querySelectorAll(".review-form").forEach((form) => {
    form.addEventListener("submit", (e) => submitReview(e));
  });
}

async function submitReview(e) {
  e.preventDefault();

  const form = e.target;
  const orderId = form.getAttribute("data-order-id");
  const productId = form.getAttribute("data-product-id");
  const rating = form.querySelector("#rating").value;
  const comment = form.querySelector("#comment").value;

  const newReview = {
    productId,
    orderId,
    rating: parseInt(rating),
    comment,
    createdAt: new Date().toISOString(),
  };

  try {
    // Save the review to db.json
    const response = await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });

    if (!response.ok) throw new Error("Failed to submit review.");

    // Hide the review form
    form.style.display = "none";

    // Display the submitted review
    const reviewContainer = document.createElement("div");
    reviewContainer.className = "submitted-review";
    reviewContainer.innerHTML = `
        <p><strong>Rating:</strong> ${newReview.rating} / 5</p>
        <p><strong>Comment:</strong> ${newReview.comment}</p>
      `;

    // Insert the review container after the form
    form.parentNode.insertBefore(reviewContainer, form.nextSibling);

    alert("Review submitted successfully!");
  } catch (error) {
    console.error("Error submitting review:", error);
    alert("Failed to submit review. Please try again.");
  }
}
