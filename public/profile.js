const API_URL = "http://localhost:5000"; // Update as needed

// Function to load user profile data
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
    if (res.ok) {
      document.getElementById("fullName").textContent = data.fullName;
      document.getElementById("username").textContent = data.username;
      document.getElementById("email").textContent = data.email;
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

// Delete account functionality
document.getElementById("deleteAccount").addEventListener("click", async () => {
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

// Load profile data when the page loads
window.addEventListener("DOMContentLoaded", loadProfile);

document.getElementById("profilePicForm").addEventListener("submit", async (e) => {
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
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        // Optionally, update the local display:
        document.getElementById("profileIconImg").src = data.profilePicture;
        // Also update the post cards if needed.
      } else {
        alert(data.message || "Error uploading profile picture.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading profile picture.");
    }
  });
  