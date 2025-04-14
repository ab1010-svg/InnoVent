const API_URL = "http://localhost:5000";

// Function to load user profile data and update profile picture if available
async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    console.log("Profile data:", data);

    if (res.ok) {
      // Update profile text
      const fullNameEl = document.getElementById("fullName");
      if (fullNameEl) fullNameEl.textContent = data.fullName;

      const usernameEl = document.getElementById("username");
      if (usernameEl) usernameEl.textContent = data.username;

      const emailEl = document.getElementById("email");
      if (emailEl) emailEl.textContent = data.email;

      // Update profile picture on profile page
      const profilePictureEl = document.getElementById("profilePicture");
      if (profilePictureEl) {
        profilePictureEl.src = data.profilePicture
          ? `${data.profilePicture}?t=${Date.now()}`
          : "default-avatar.png"; // fallback image
      }

      // Optionally update nav avatar if exists
      const navImg = document.getElementById("profileIconImg");
      if (navImg) {
        navImg.src = data.profilePicture
          ? `${data.profilePicture}?t=${Date.now()}`
          : "default-avatar.png";
      }

    } else {
      alert("Session expired or error fetching profile. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    alert("Error fetching profile. Please try again.");
  }
}

// Delete account
const deleteAccountBtn = document.getElementById("deleteAccount");
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/user/profile`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();
        if (res.ok) {
          alert("Account deleted successfully.");
          localStorage.clear();
          window.location.href = "register.html";
        } else {
          alert(data.message || "Error deleting account.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
      }
    }
  });
}

// DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  const profilePicForm = document.getElementById("profilePicForm");
  if (profilePicForm) {
    profilePicForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in.");
        return;
      }

      const formData = new FormData();
      const fileInput = document.getElementById("profilePictureInput");
      formData.append("profilePicture", fileInput.files[0]);

      try {
        const res = await fetch(`${API_URL}/user/profilePicture`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        console.log("Upload response:", data);
        if (res.ok) {
          alert(data.message);

          // Refresh both images (profile and nav)
          const profilePictureEl = document.getElementById("profilePicture");
          if (profilePictureEl) {
            profilePictureEl.src = `${data.profilePicture}?t=${Date.now()}`;
          }

          const navImg = document.getElementById("profileIconImg");
          if (navImg) {
            navImg.src = `${data.profilePicture}?t=${Date.now()}`;
          }
        } else {
          alert(data.message || "Error uploading profile picture.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading profile picture.");
      }
    });
  } else {
    console.log("Profile picture upload form not found on this page.");
  }
});
