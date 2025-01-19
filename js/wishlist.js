import { WishList } from "./wishList/wishList.js";
import {
  updateCartCount,
  updateHeaderAuthState,
  loginRedirect,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize and display wishlist
  const wishList = new WishList();
  wishList.displayWishList();

  updateHeaderAuthState();
  updateCartCount();
  loginRedirect();
});
