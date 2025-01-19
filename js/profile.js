import { updateHeaderAuthState, updateCartCount } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.href = "./login.html";
    return;
  }

  updateCartCount();
  initializeProfile(currentUser);
  updateHeaderAuthState();
  setupImageUpload(currentUser);
  setupProfileEdit(currentUser);
});

function initializeProfile(currentUser) {
  // If image path exists, use it directly
  const profileImage = document.getElementById("profileImage");
  profileImage.src = currentUser.imagePath || './assets/default-profile.png';
  
  document.getElementById("profileName").textContent = currentUser.name;
  document.getElementById("profileEmail").textContent = currentUser.email;
  document.getElementById("profileRole").textContent = `Role: ${currentUser.role}`;
}

function setupImageUpload(currentUser) {
  const imageUpload = document.getElementById("imageUpload");
  const changePictureBtn = document.getElementById("changePictureBtn");

  changePictureBtn.addEventListener("click", () => imageUpload.click());

  imageUpload.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "Please select a valid image file.", "error");
      return;
    }

    try {
      // Generate a unique filename
      const fileName = `profile-${currentUser.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const imagePath = `./uploads/${fileName}`; // Adjust path according to your project structure
      
      // Save the file to your uploads directory
      await saveImageToUploads(file, fileName);
      
      // Update user data with the image path
      await updateUserImage(currentUser, imagePath);
      
      // Update UI
      document.getElementById("profileImage").src = imagePath;
      Swal.fire("Updated!", "Your profile picture has been updated.", "success");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Swal.fire("Error", "Failed to update profile picture. Please try again.", "error");
    }
  });
}

async function saveImageToUploads(file, fileName) {
  // Create FormData to send the file
  const formData = new FormData();
  formData.append('image', file, fileName);

  // Send to your server endpoint that handles file uploads
  const response = await fetch('http://localhost:3001/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }
}

async function updateUserImage(currentUser, imagePath) {
  // Update user data
  currentUser.imagePath = imagePath;
  delete currentUser.image; // Remove old base64 image if it exists
  
  // Update localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Update database
  const response = await fetch(`http://localhost:3001/users/${currentUser.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(currentUser)
  });

  if (!response.ok) {
    throw new Error("Failed to update profile picture in the database.");
  }
}

function setupProfileEdit(currentUser) {
  document.getElementById("editProfileBtn").addEventListener("click", () => {
    Swal.fire({
      title: "Edit Profile",
      html:
        `<input id="swal-name" class="swal2-input" placeholder="Name" value="${currentUser.name}">` +
        `<input id="swal-email" class="swal2-input" placeholder="Email" value="${currentUser.email}">` +
        `<input id="swal-password" class="swal2-input" placeholder="New Password" type="password">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      preConfirm: validateProfileForm
    }).then((result) => handleProfileUpdate(result, currentUser));
  });
}

function validateProfileForm() {
  const name = document.getElementById("swal-name").value;
  const email = document.getElementById("swal-email").value;
  const password = document.getElementById("swal-password").value;

  if (!name || !email) {
    Swal.showValidationMessage("Name and Email are required!");
    return false;
  }
  return { name, email, password };
}

async function handleProfileUpdate(result, currentUser) {
  if (!result.isConfirmed) return;

  const { name, email, password } = result.value;

  try {
    currentUser.name = name;
    currentUser.email = email;
    if (password) currentUser.password = password;

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    const response = await fetch(`http://localhost:3001/users/${currentUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentUser)
    });

    if (!response.ok) {
      throw new Error("Failed to update user in the database.");
    }

    document.getElementById("profileName").textContent = name;
    document.getElementById("profileEmail").textContent = email;
    Swal.fire("Updated!", "Your profile has been updated.", "success");
  } catch (error) {
    console.error("Error updating profile:", error);
    Swal.fire("Error", "Failed to update profile. Please try again.", "error");
  }
}