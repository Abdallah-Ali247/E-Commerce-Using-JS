document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;

    // Validate password match
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(`invalid password ==> it must has
        1_At least one lowercase letter
        2_At least one uppercase letter
        3_At least one digit
        4_At least one special character
        5_Minimum 8 characters
        6_Like:"StrongP@ssw0rd"`);
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Create new user object
    const newUser = {
      name,
      email,
      password,
      role,
      image: "../imgs/user_profile/profile.png",
      createdAt: new Date().toISOString(),
      status: role === "seller" ? "pending" : "active", // Set status to 'pending' for sellers
    };

    try {
      // Check if the email already exists
      const response = await fetch("http://localhost:3001/users");
      const users = await response.json();
      const emailExists = users.some((user) => user.email === email);

      if (emailExists) {
        alert("Email already registered!");
        return;
      }

      // Save the new user to the database
      const saveResponse = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to register user.");
      }

      // Show appropriate message based on role
      if (role === "seller") {
        window.location.href = "../home.html";
        alert(
          "Registration successful! Your account is pending admin approval."
        );
      } else {
        alert("Registration successful! You can now log in.");
        localStorage.setItem("currentUser", JSON.stringify(newUser)); // Store user in localStorage
        window.location.href = "../home.html"; // Redirect to home page
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Failed to register. Please try again.");
    }
  });
});
