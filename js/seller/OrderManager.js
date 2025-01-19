export class OrderManager {
  constructor(sellerId) {
    this.sellerId = sellerId;
  }

  // Fetch orders for the seller
  async fetchOrders() {
    const ordersTableBody = document.getElementById("ordersTableBody");
    try {
      const [ordersResponse, usersResponse, productsResponse] =
        await Promise.all([
          fetch("http://localhost:3001/orders"),
          fetch("http://localhost:3001/users"),
          fetch("http://localhost:3001/products"),
        ]);

      if (!ordersResponse.ok || !usersResponse.ok || !productsResponse.ok) {
        throw new Error("Failed to fetch data.");
      }

      const orders = await ordersResponse.json();
      const users = await usersResponse.json();
      const products = await productsResponse.json();

      // Clear existing content
      ordersTableBody.innerHTML = "";

      // Generate HTML for each order
      orders.forEach((order) => {
        const customer = users.find(
          (user) => String(user.id) === String(order.customerId)
        );
        const customerName = customer ? customer.name : "Unknown Customer";

        const productNames = order.products
          .map((item) => {
            const product = products.find(
              (p) => String(p.id) === String(item.productId)
            );
            return product
              ? `${product.name} (x${item.quantity})`
              : "Unknown Product";
          })
          .join(", ");

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${order.id}</td>
          <td>${customerName}</td>
          <td>${productNames}</td>
          <td>$${order.totalAmount.toFixed(2)}</td>
          <td>${order.status || "pending"}</td>
          <td class="actions">
            ${
              order.status === "pending"
                ? `
              <button class="approve" data-order-id="${order.id}">Approve</button>
              <button class="reject" data-order-id="${order.id}">Reject</button>
            `
                : `
              <select class="status-dropdown" data-order-id="${order.id}">
                <option value="shipped" ${
                  order.status === "shipped" ? "selected" : ""
                }>Shipped</option>
                <option value="delivered" ${
                  order.status === "delivered" ? "selected" : ""
                }>Delivered</option>
                <option value="cancelled" ${
                  order.status === "cancelled" ? "selected" : ""
                }>Cancelled</option>
              </select>
              <button class="update-status" data-order-id="${
                order.id
              }">Update</button>
            `
            }
          </td>
        `;
        ordersTableBody.appendChild(row);
      });

      // Add event listeners for approve/reject buttons
      document.querySelectorAll(".approve[data-order-id]").forEach((button) => {
        button.addEventListener("click", () =>
          this.approveRejectOrder(button.dataset.orderId, "approved")
        );
      });
      document.querySelectorAll(".reject[data-order-id]").forEach((button) => {
        button.addEventListener("click", () =>
          this.approveRejectOrder(button.dataset.orderId, "rejected")
        );
      });

      // Add event listeners for update status buttons
      document
        .querySelectorAll(".update-status[data-order-id]")
        .forEach((button) => {
          button.addEventListener("click", () => {
            const orderId = button.dataset.orderId;
            const statusDropdown = document.querySelector(
              `.status-dropdown[data-order-id="${orderId}"]`
            );
            const newStatus = statusDropdown.value;
            this.updateOrderStatus(orderId, newStatus);
          });
        });
    } catch (error) {
      console.error("Error fetching orders:", error);
      ordersTableBody.innerHTML =
        '<tr><td colspan="6">Failed to load orders. Please try again later.</td></tr>';
    }
  }

  // Approve or reject an order
  async approveRejectOrder(orderId, status) {
    try {
      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status.");
      }

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Order Status Updated",
        text: `Order #${orderId} has been ${status}.`,
      });

      // Refresh the orders table
      this.fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Update Status",
        text: "An error occurred while updating the order status. Please try again.",
      });
    }
  }

  // Update order status (for shipped, delivered, cancelled)
  async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status.");
      }

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Order Status Updated",
        text: `Order #${orderId} status has been updated to "${newStatus}".`,
      });

      // Refresh the orders table
      this.fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Update Status",
        text: "An error occurred while updating the order status. Please try again.",
      });
    }
  }
}
