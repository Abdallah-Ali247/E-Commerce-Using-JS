document.addEventListener("DOMContentLoaded", () => {
  
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if(user){
    const conf = confirm('Do you want to LogOut ....... ');
    if(conf){
      localStorage.removeItem("currentUser");
    }else{
      window.location.href = "../home.html";
    }
  }


  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form submission

    // Get form data
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Fetch users from db.json
    try {
      const response = await fetch("http://localhost:3001/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const users = await response.json();

      // Find the user with matching email and password
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Check user status
        if (user.status === "pending") {
          alert("Your account is pending approval. Please contact the admin.");
          return;
        } else if (user.status === "rejected") {
          alert("Your account has been rejected. Please contact the admin.");
          return;
        } else if (user.status === "archived") {
          alert("Your account has an Issue . Please contact the admin.");
          return;
        }

        // Save user data to localStorage (for session management)
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Initialize user-specific cart if it doesn't exist
        if (!localStorage.getItem(`cart_${user.id}`)) {
          localStorage.setItem(`cart_${user.id}`, JSON.stringify([]));
        }

        // Redirect based on user role
        switch (user.role) {
          case "customer":
            window.location.href = "../home.html";
            break;
          case "seller":
            window.location.href = "../html/seller.html";
            break;
          case "admin":
            window.location.href = "../html/admin.html";
            break;
          default:
            alert("Invalid role. Please contact support.");
        }
      } else {
        alert("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Failed to login. Please try again later.");
    }
  });
});
