import { CustomFetch } from "./customFetch.js";
import { addToCart } from "../utils.js";



export class WishList {
    constructor() {
        this.customFetch = new CustomFetch('wishlist');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')); // Get current user from localStorage
    }

    async displayWishList() {
        try {
            // Fetch all wishlists
            const wishlists = await this.customFetch.fetchData();

            // Find the wishlist for the current user
            const userWishlist = wishlists.find(wishlist => String(wishlist.customerId) === String(this.currentUser.id));

            if (!userWishlist) {
                console.log("No wishlist found for the current user.");
                return;
            }

            // Fetch product details for each product in the wishlist
            const productIds = userWishlist.products;
            const products = await this.fetchProductsByIds(productIds);

            // Display the products in the cart section
            this.renderProducts(products, userWishlist);
        } catch (error) {
            console.error("Error displaying wishlist:", error);
        }
    }

    async fetchProductsByIds(productIds) {
        const products = [];
        for (const id of productIds) {
            const productFetch = new CustomFetch('products', id);
            const product = await productFetch.fetchData();
            products.push(product);
        }
        return products;
    }

    renderProducts(products, userWishlist) {
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        if (!cartItemsContainer) {
            console.error("Cart items container not found.");
            return;
        }

        // Clear existing content
        cartItemsContainer.innerHTML = '';

        // Render each product
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'cart-item';
            
            // Array of animations
            const animations = ["zoom-out", "fade-up", "flip-left", "fade-right", "slide-up"]; 
            const anim = Math.round(Math.random()*animations.length)
            // set the `data-aos` attribute js animation
            productElement.setAttribute("data-aos", animations[anim]);
            // Set a slower animation duration 1s
            productElement.setAttribute("data-aos-duration", "1500");
            
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" />
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Price: $${product.price}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
            `;
            cartItemsContainer.appendChild(productElement);
        });

        // Add event listeners to "Add to Cart" buttons
        this.addAddToCartEventListeners(userWishlist);
    }

    addAddToCartEventListeners(userWishlist) {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.getAttribute('data-product-id');
                addToCart(productId);

                // Remove the product from the wishlist
                this.removeFromWishlist(productId, userWishlist);

                // Hide the button after adding to cart
                event.target.style.display = 'none';
            });
        });
    }
    async removeFromWishlist(productId, userWishlist) {
        try {
            // Remove the product from the wishlist (return all ids except current)
            userWishlist.products = userWishlist.products.filter(id => String(id) !== String(productId));
            
            const updatedWishlist = {
                id: userWishlist.id,
                customerId: userWishlist.customerId,
                products: userWishlist.products,
            };
            // Update the wishlist on the server
            const updateWishlistFetch = new CustomFetch('wishlist', String(userWishlist.id), updatedWishlist);
            await updateWishlistFetch.putData(); // Use the putData method to update the wishlist
    
            console.log(`Product ${productId} removed from wishlist.`);
    
            // Refresh the displayed wishlist after removing the product
            this.displayWishList();
        } catch (error) {
            console.error("Error removing product from wishlist:", error);
        }
    }
}



