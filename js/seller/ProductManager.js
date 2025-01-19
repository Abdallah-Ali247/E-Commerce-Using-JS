export class ProductManager {
  constructor(sellerId) {
    this.sellerId = sellerId;
  }

  // Fetch products for the seller
  async fetchProducts() {
    const productsTableBody = document.getElementById("productsTableBody");
    try {
      const response = await fetch(
        `http://localhost:3001/products?sellerId=${this.sellerId}`
      );
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
          <td>${product.status || "active"}</td>
          <td class="actions">
            <button class="edit" data-product-id="${product.id}">Edit</button>
            <button class="delete" data-product-id="${
              product.id
            }">Archive</button>
          </td>
        `;
        productsTableBody.appendChild(row);
      });

      // Add event listeners for edit and delete buttons
      document.querySelectorAll(".edit[data-product-id]").forEach((button) => {
        button.addEventListener("click", () =>
          this.editProduct(button.dataset.productId)
        );
      });
      document
        .querySelectorAll(".delete[data-product-id]")
        .forEach((button) => {
          button.addEventListener("click", () =>
            this.deleteProduct(button.dataset.productId)
          );
        });
    } catch (error) {
      console.error("Error fetching products:", error);
      productsTableBody.innerHTML =
        '<tr><td colspan="7">Failed to load products. Please try again later.</td></tr>';
    }
  }

  // Add a new product
  async addProduct() {
    // Fetch categories from db.json
    const categoriesResponse = await fetch("http://localhost:3001/categories");
    const categories = await categoriesResponse.json();

    // Generate HTML for category dropdown
    const categoryOptions = categories
      .map(
        (category) => `
      <option value="${category.name}">${category.name}</option>
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
          sellerId: this.sellerId,
          stock: parseInt(document.getElementById("stock").value),
          featured: document.getElementById("featured").checked,
          status: "pending", // Set status to 'pending' for admin approval
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newProduct = result.value;
        fetch("http://localhost:3001/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        }).then(() => this.fetchProducts()); // Refresh the table
      }
    });
  }

  // Edit a product
  async editProduct(productId) {
    const productResponse = await fetch(
      `http://localhost:3001/products/${productId}`
    );
    const product = await productResponse.json();

    Swal.fire({
      title: "Edit Product",
      html: `Name: <input id="name" class="swal2-input" value="${
        product.name
      }"/>
        <br>Descrip: <input id="description" class="swal2-input" value="${
          product.description
        }"/>
        <br>Price: <input id="price" class="swal2-input" type="number" value="${
          product.price
        }"/>
        <br>Category: <input id="category" class="swal2-input" value="${
          product.category
        }"/>
        <br>Image: <input id="image" class="swal2-input" value="${
          product.image
        }"/>
        <br>Stock: <input id="stock" class="swal2-input" type="number" value="${
          product.stock
        }"/>
        <br>Statuse:<select id="status" class="swal2-input">
            <option value="active" ${
              product.status === "active" ? "selected" : ""
            }>Active</option>
            <option value="archived" ${
              product.status === "archived" ? "selected" : ""
            }>Archived</option>
          </select>
        <br>Featured: <input id="featured" class="swal2-input" type="checkbox" ${
          product.featured ? "checked" : ""
        }/>`,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: () => {
        return {
          name: document.getElementById("name").value,
          description: document.getElementById("description").value,
          price: parseFloat(document.getElementById("price").value),
          category: document.getElementById("category").value,
          image: document.getElementById("image").value,
          stock: parseInt(document.getElementById("stock").value),
          featured: document.getElementById("featured").checked,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:3001/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.value),
        }).then(() => this.fetchProducts()); // Refresh the table
      }
    });
  }

  // Archive a product
  async deleteProduct(productId) {
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
        }).then(() => this.fetchProducts()); // Refresh the table
      }
    });
  }
}
