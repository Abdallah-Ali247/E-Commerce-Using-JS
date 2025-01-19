import { updateHeaderAuthState, updateCartCount, search } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // check if user admin or not
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("You do not have permission to access this page.");
    window.location.href = "../html/login.html";
    return;
  }
  updateHeaderAuthState(); // update login info
  updateCartCount(); // update cart count
  
  // initialize tabs
  const tabs = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // ad event for each tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // add active class to the clicked tab and corresponding content
      tab.classList.add("active");
      const tabId = tab.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");

      // display data for the selected tab
      if (tabId === "users") {
        fetchUsers();
      } else if (tabId === "products") {
        fetchProducts();
      } else if (tabId === "orders") {
        fetchOrders();
      }
    });
  });

  /* ************ user manage ************* */
  // load users by default
  fetchUsers();
  // add New User Button
  document.getElementById("addUserButton").addEventListener("click", addUser);
  // user Search
  document.getElementById("searchUsersButton").addEventListener("click", () => {
    search("#searchUsersInput", "#usersTableBody");
  });
  document.getElementById("clearSearch").addEventListener("click", () => {
    document.querySelector("#searchUsersInput").value = "";
    fetchUsers();
  });

  // products Seacrch
  document
    .getElementById("searchProductsButton")
    .addEventListener("click", () => {
      search("#searchProductsInput", "#productsTableBody");
    });
  document.getElementById("clearSearchP").addEventListener("click", () => {
    document.querySelector("#searchProductsInput").value = "";
    fetchProducts();
  });

  // search Orders
  document.getElementById("searchOrderButton").addEventListener("click", () => {
    search("#searchOrderInput", "#ordersTableBody");
  });
  document.getElementById("clearSearchO").addEventListener("click", () => {
    document.querySelector("#searchOrderInput").value = "";
    fetchOrders();
  });
});

// fetch and display users
async function fetchUsers() {
  const usersTableBody = document.getElementById("usersTableBody");
  try {
    const response = await fetch("http://localhost:3001/users");
    if (!response.ok) throw new Error("Failed to fetch users");
    const users = await response.json();

    // clear existing content
    usersTableBody.innerHTML = "";

    // filter out other admins if the current user is not an admin
    const filteredUsers = users.filter((user) => {
      if (user.role === "admin") {
        return false; // hide other admins
      }
      return true; // show all other users
    });

    // create row for each user
    filteredUsers.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.status || "active"}</td>
        <td class="actions">
          ${
            user.role === "seller" && user.status === "pending"
              ? `
            <button class="approve" data-user-id="${user.id}">Approve</button>
            <button class="reject" data-user-id="${user.id}">Reject</button>
          `
              : `
            <button class="edit" data-user-id="${user.id}">Edit</button>
            <button class="delete" data-user-id="${user.id}">Archive</button>
          `
          }
        </td>
      `;// if role= selle then display aprove & reject , if not display edite & archive
      
      usersTableBody.appendChild(row); // append row to the table
    });

    // add event listeners for approve buttons
    document.querySelectorAll(".approve[data-user-id]").forEach((button) => {
      button.addEventListener("click", () =>
        // pass user id & `active`
        approveRejectUser(button.dataset.userId, "active") // element.dataset : to get the custom attr data*
      );
    });
    // add event listeners for reject buttons
    document.querySelectorAll(".reject[data-user-id]").forEach((button) => {
      button.addEventListener("click", () =>
        approveRejectUser(button.dataset.userId, "rejected")
      );
    });

    // add event listeners for edit and delete buttons
    document.querySelectorAll(".edit[data-user-id]").forEach((button) => {
      button.addEventListener("click", () => editUser(button.dataset.userId));
    });
    document.querySelectorAll(".delete[data-user-id]").forEach((button) => {
      button.addEventListener("click", () => deleteUser(button.dataset.userId));
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    usersTableBody.innerHTML =
      '<tr><td colspan="6">Failed to load users. Please try again later.</td></tr>';
  }
}

// add New User
function addUser() {
  Swal.fire({
    title: "Add New User",
    html: `Name: <input id="name" class="swal2-input" placeholder="Name">
      Email: <input type="email" id="email" class="swal2-input" placeholder="Email">
      Pass: <input id="password" class="swal2-input" type="password" placeholder="Password">
      <br>Role: <select id="role" class="swal2-input">
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
        <option value="admin">Admin</option>
      </select>
      status: <select id="status" class="swal2-input">
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>`,
    showCancelButton: true,
    confirmButtonText: "Add",
    preConfirm: () => {
      return {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
        status: document.getElementById("status").value,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newUser = {
        name: result.value.name,
        email: result.value.email,
        password: result.value.password,
        role: result.value.role,
        image: "../imgs/user_profile/profile.png",
        status:
          result.value.role === "seller" ? "pending" : result.value.status, // set status to 'pending' for sellers
        createdAt: new Date().toJSON().slice(0, 10).replace(/-/g, "/"), // get current date
      };
      fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      }).then(() => fetchUsers()); // refresh the table
    }
  });
}

// edit User
function editUser(userId) {
  fetch(`http://localhost:3001/users/${userId}`)
    .then((res) => res.json())
    .then((user) => {
      Swal.fire({ // create a form to update user 
        title: "Edit User",
        html: `Name: <input id="name" class="swal2-input" value="${user.name}">
          Email: <input type="email" id="email" class="swal2-input" value="${
            user.email
          }">
          Pass: <input id="password" class="swal2-input" type="password" value="${
            user.password
          }">
          <br>Role: <select id="role" class="swal2-input">
            <option value="customer" ${
              user.role === "customer" ? "selected" : ""
            }>Customer</option>
            <option value="seller" ${
              user.role === "seller" ? "selected" : ""
            }>Seller</option>
            <option value="admin" ${
              user.role === "admin" ? "selected" : ""
            }>Admin</option>
          </select>
          Status: <select id="status" class="swal2-input">
            <option value="active" ${
              user.status === "active" ? "selected" : ""
            }>Active</option>
            <option value="archived" ${
              user.status === "archived" ? "selected" : ""
            }>Archived</option>
          </select>`,
        showCancelButton: true,
        confirmButtonText: "Save",
        preConfirm: () => {
          // create object with updated data
          return {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value,
            status: document.getElementById("status").value,
          };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // update user in database
          fetch(`http://localhost:3001/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value),
          }).then(() => fetchUsers()); // refresh the table
        }
      });
    });
}

// archive User
function deleteUser(userId) {
  Swal.fire({
    title: "Are you sure?",
    text: "This user will be archived.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Archive",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3001/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      }).then(() => fetchUsers()); // refresh the table
    }
  });
}

// approve or Reject User
function approveRejectUser(userId, status) {
  fetch(`http://localhost:3001/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(() => fetchUsers()); // refresh the table
}

/* **************************************************************** */
/* *************************** Product Management ***************** */

// Fetch and display products
async function fetchProducts() {
  const productsTableBody = document.getElementById("productsTableBody");
  try {
    const response = await fetch("http://localhost:3001/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const products = await response.json();

    // Clear existing content
    productsTableBody.innerHTML = "";

    // Generate HTML for each product
    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.category}</td>
        <td>${product.stock}</td>
        <td>${product.status}</td>
        <td class="actions">
          ${
            product.status === "pending"
              ? `
            <button class="approve" data-product-id="${product.id}">Approve</button>
            <button class="reject" data-product-id="${product.id}">Reject</button>
          `
              : `
          <button class="edit" data-product-id="${product.id}">Edit</button>
          <button class="delete" data-product-id="${product.id}">Archive</button>
          `
          }
        </td>
      `;
      productsTableBody.appendChild(row);
    });

    // Add event listeners for approve/reject buttons
    document.querySelectorAll(".approve[data-product-id]").forEach((button) => {
      button.addEventListener("click", () =>
        approveRejectProduct(button.dataset.productId, "approved")
      );
    });
    document.querySelectorAll(".reject[data-product-id]").forEach((button) => {
      button.addEventListener("click", () =>
        approveRejectProduct(button.dataset.productId, "rejected")
      );
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit[data-product-id]").forEach((button) => {
      button.addEventListener("click", () =>
        editProduct(button.dataset.productId)
      );
    });
    document.querySelectorAll(".delete[data-product-id]").forEach((button) => {
      button.addEventListener("click", () =>
        deleteProduct(button.dataset.productId)
      );
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    productsTableBody.innerHTML =
      '<tr><td colspan="7">Failed to load products. Please try again later.</td></tr>';
  }
}

// Edit Product
function editProduct(productId) {
  fetch(`http://localhost:3001/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      Swal.fire({
        title: "Edit Product",
        html:
          `Name: <input id="name" class="swal2-input" value="${product.name}"/>
          Descrip: <input id="description" class="swal2-input" value="${product.description}"/>
          Price: <input id="price" class="swal2-input" type="number" value="${product.price}"/>
          Category: <input id="category" class="swal2-input" value="${product.category}"/>
          Image: <input id="image" class="swal2-input" value="${product.image}"/>
          SellerID: <input id="sellerId" class="swal2-input" type="number" value="${product.sellerId}"/>
          Stock: <input id="stock" class="swal2-input" type="number" value="${product.stock}"/>
          <br>Statuse:<select id="status" class="swal2-input">
            <option value="approved" ${
              product.status === "approved" ? "selected" : ""
            }>Approved</option>
            <option value="archived" ${
              product.status === "archived" ? "selected" : ""
            }>Archived</option>
          </select> <br>
          Featured: <input id="featured" class="swal2-input" type="checkbox" ${
            product.featured ? "checked" : ""
          }/> `,
        showCancelButton: true,
        confirmButtonText: "Save",
        preConfirm: () => {
          return {
            name: document.getElementById("name").value,
            description: document.getElementById("description").value,
            price: parseFloat(document.getElementById("price").value),
            category: document.getElementById("category").value,
            image: document.getElementById("image").value,
            sellerId: parseInt(document.getElementById("sellerId").value),
            stock: parseInt(document.getElementById("stock").value),
            featured: document.getElementById("featured").checked,
            status: document.getElementById("status").value,
          };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`http://localhost:3001/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value),
          }).then(() => fetchProducts()); // Refresh the table
        }
      });
    });
}

// Archive Product
function deleteProduct(productId) {
  Swal.fire({
    title: "Are you sure?",
    text: "This product will be archived.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Archive",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3001/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      }).then(() => fetchProducts()); // Refresh the table
    }
  });
}

// Approve or Reject Product
function approveRejectProduct(productId, status) {
  fetch(`http://localhost:3001/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(() => fetchProducts()); // Refresh the table
}

// Add New Product Button
document
  .getElementById("addProductButton")
  .addEventListener("click", addProduct);

// Add New Product
async function addProduct() {
  // Fetch categories and sellers from db.json
  const [categoriesResponse, sellersResponse] = await Promise.all([
    fetch("http://localhost:3001/categories"),
    fetch("http://localhost:3001/users?role=seller"), // fetch seller only
  ]);

  if (!categoriesResponse.ok || !sellersResponse.ok) {
    alert("Failed to fetch categories or sellers. Please try again later.");
    return;
  }

  const categories = await categoriesResponse.json();
  const sellers = await sellersResponse.json();

  // Generate HTML for category and seller dropdowns
  const categoryOptions = categories
    .map(
      (category) => `
    <option value="${category.name}">${category.name}</option>
  `
    )
    .join("");

  const sellerOptions = sellers
    .map(
      (seller) => `
    <option value="${seller.id}">${seller.name} (ID: ${seller.id})</option>
  `
    )
    .join("");

  Swal.fire({
    title: "Add New Product",
    html: `Name: <input id="name" class="swal2-input" placeholder="Product Name">
      <br>Descrip: <input id="description" class="swal2-input" placeholder="Description">
      <br>Price: <input id="price" class="swal2-input" type="number" placeholder="Price">
      <br>Image: <input id="image" class="swal2-input" placeholder="Image URL">
      <br>Category: <select id="category" class="swal2-input">${categoryOptions}</select>
      <br>Seller: <select id="sellerId" class="swal2-input">${sellerOptions}</select>
      <br>Stock: <input id="stock" class="swal2-input" type="number" placeholder="Stock">
      <br>Featured: <input id="featured" class="swal2-input" type="checkbox"> Featured</input>`,
    showCancelButton: true,
    confirmButtonText: "Add",
    preConfirm: () => {
      return {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        price: parseFloat(document.getElementById("price").value),
        category: document.getElementById("category").value,
        image: document.getElementById("image").value,
        sellerId: parseInt(document.getElementById("sellerId").value),
        stock: parseInt(document.getElementById("stock").value),
        featured: document.getElementById("featured").checked,
        status: "approved", // Set status to 'active' by default
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newProduct = result.value;
      fetch("http://localhost:3001/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      }).then(() => fetchProducts()); // Refresh the table
    }
  });
}

/* *********************************************** */
/* ******************** Order Mangements ********* */

// Fetch and display orders
async function fetchOrders() {
  const ordersTableBody = document.getElementById("ordersTableBody");
  try {
    // Fetch orders, users, and products from db.json
    const [ordersResponse, usersResponse, productsResponse] = await Promise.all(
      [
        fetch("http://localhost:3001/orders"),
        fetch("http://localhost:3001/users"),
        fetch("http://localhost:3001/products"),
      ]
    );

    if (!ordersResponse.ok && !usersResponse.ok && !productsResponse.ok) {
      throw new Error("Failed to fetch data.");
    }

    const orders = await ordersResponse.json();
    const users = await usersResponse.json();
    const products = await productsResponse.json();

    // Clear existing content
    ordersTableBody.innerHTML = "";

    // Generate HTML for each order
    orders.forEach((order) => {
      // Find customer name
      const customer = users.find(
        (user) => String(user.id) === String(order.customerId)
      );
      const customerName = customer ? customer.name : "Unknown Customer";

      // Find product names
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
          <button class="delete" data-order-id="${order.id}">Archive</button>
        `
          }
        </td>
      `;
      ordersTableBody.appendChild(row);
    });

    // Add event listeners for approve/reject buttons
    document.querySelectorAll(".approve[data-order-id]").forEach((button) => {
      button.addEventListener("click", () =>
        approveRejectOrder(button.dataset.orderId, "approved")
      );
    });
    document.querySelectorAll(".reject[data-order-id]").forEach((button) => {
      button.addEventListener("click", () =>
        approveRejectOrder(button.dataset.orderId, "rejected")
      );
    });

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete[data-order-id]").forEach((button) => {
      button.addEventListener("click", () =>
        deleteOrder(button.dataset.orderId)
      );
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    ordersTableBody.innerHTML =
      '<tr><td colspan="6">Failed to load orders. Please try again later.</td></tr>';
  }
}

// Approve or Reject Order
function approveRejectOrder(orderId, status) {
  fetch(`http://localhost:3001/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(() => fetchOrders()); // Refresh the table
}

// Archive Order
function deleteOrder(orderId) {
  Swal.fire({
    title: "Are you sure?",
    text: "This order will be archived.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Archive",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      }).then(() => fetchOrders()); // Refresh the table
    }
  });
}

/* ********************************************************** */
/* ******************** Export a report ********************* */

// Utility function to export data to CSV
function exportToCSV(data, filename) {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    data.map((row) => row.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Users
document
  .getElementById("exportUsersButton")
  .addEventListener("click", async () => {
    const response = await fetch("http://localhost:3001/users");
    const users = await response.json();

    // Prepare CSV data
    const headers = ["ID", "Name", "Email", "Role", "Status"];
    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.status || "active",
    ]);

    // Export to CSV
    exportToCSV([headers, ...rows], "users_report.csv");
  });

// Export Products
document
  .getElementById("exportProductsButton")
  .addEventListener("click", async () => {
    const response = await fetch("http://localhost:3001/products");
    const products = await response.json();

    // Prepare CSV data
    const headers = ["ID", "Name", "Price", "Category", "Stock", "Status"];
    const rows = products.map((product) => [
      product.id,
      product.name,
      product.price,
      product.category,
      product.stock,
      product.status || "active",
    ]);

    // Export to CSV
    exportToCSV([headers, ...rows], "products_report.csv");
  });

// Export Orders
document
  .getElementById("exportOrdersButton")
  .addEventListener("click", async () => {
    const [ordersResponse, usersResponse, productsResponse] = await Promise.all(
      [
        fetch("http://localhost:3001/orders"),
        fetch("http://localhost:3001/users"),
        fetch("http://localhost:3001/products"),
      ]
    );

    const orders = await ordersResponse.json();
    const users = await usersResponse.json();
    const products = await productsResponse.json();

    // Prepare CSV data
    const headers = ["ID", "Customer", "Products", "Total Amount", "Status"];
    const rows = orders.map((order) => {
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

      return [
        order.id,
        customerName,
        productNames,
        order.totalAmount.toFixed(2),
        order.status || "pending",
      ];
    });

    // Export to CSV
    exportToCSV([headers, ...rows], "orders_report.csv");
  });
