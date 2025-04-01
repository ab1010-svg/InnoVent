const API_URL = "http://localhost:5000"; // Duplicate declaration removed
document.addEventListener("DOMContentLoaded", function () {
    const sponsoredContainer = document.querySelector('.sponsored-container');
    const leftArrow = document.querySelector('.arrow.left');
    const rightArrow = document.querySelector('.arrow.right');
  
    // Function to update arrow visibility
    function updateArrowsVisibility() {
        // Tolerance value to account for minor rounding differences
        const tolerance = 5;
      
        // Hide left arrow if at the very beginning
        if (sponsoredContainer.scrollLeft <= tolerance) {
          leftArrow.style.display = 'none';
        } else {
          leftArrow.style.display = 'flex';
        }
      
        // Hide right arrow if scrolled close enough to the end
        if (sponsoredContainer.scrollLeft + sponsoredContainer.clientWidth >= sponsoredContainer.scrollWidth - tolerance) {
          rightArrow.style.display = 'none';
        } else {
          rightArrow.style.display = 'flex';
        }
      }
      
  
    // Update arrow visibility on scroll
    sponsoredContainer.addEventListener('scroll', updateArrowsVisibility);
  
    // Scroll functionality for the arrows
    leftArrow.addEventListener('click', () => {
      sponsoredContainer.scrollBy({ left: -300, behavior: 'smooth' });
    });
    
    rightArrow.addEventListener('click', () => {
      sponsoredContainer.scrollBy({ left: 300, behavior: 'smooth' });
    });
  
    // Initial check on page load
    updateArrowsVisibility();
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const imageModal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeModalButton = imageModal.querySelector(".close");
  
    // Event delegation for post cards (dynamically added elements)
    const postsContainer = document.getElementById("postsContainer");
    postsContainer.addEventListener("click", (event) => {
      // Check if the clicked element or one of its ancestors has the class "card"
      const card = event.target.closest(".card");
      if (card) {
        // Use getComputedStyle to reliably get the background image
        const bgImage = window.getComputedStyle(card).backgroundImage;
        console.log("Card clicked. Background image raw:", bgImage);
    
        if (bgImage && bgImage !== "none") {
          // Extract URL from format: url("...")
          const imageUrl = bgImage.slice(5, bgImage.length - 2);
          console.log("Extracted image URL:", imageUrl);
          modalImg.src = imageUrl;
          imageModal.classList.add("active"); // or imageModal.style.display = "flex";
        } else {
          console.error("No background image found on this card.");
        }
      }
    });
    
    // Close modal on close button click
    closeModalButton.addEventListener("click", () => {
      imageModal.classList.remove("active"); // or set display to "none"
    });
    
    // Close modal if clicking outside the modal content
    window.addEventListener("click", (event) => {
      if (event.target === imageModal) {
        imageModal.classList.remove("active");
      }
    });
  });
  

  

  async function registerUser(event) {
    event.preventDefault();
    const fullName = document.getElementById("register-fullName").value;
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, username, email, password })
        });

        const data = await res.json();
        console.log("Registration response:", data);

        if (res.ok) {
            alert("Registration successful! Please login.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Error registering user.");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("Error registering user.");
    }
}





// LOGIN FUNCTION
async function loginUser(event) {
    event.preventDefault();
    // Get the identifier (email or username) from the new input field
    const identifier = document.getElementById("login-identifier").value;
    const password = document.getElementById("login-password").value;
    const loginMessage = document.getElementById("login-message"); // User feedback

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Send the identifier instead of email
            body: JSON.stringify({ identifier, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username); // Ensure your API returns a username
            console.log("Stored username:", localStorage.getItem("username"));

            loginMessage.style.color = "green";
            loginMessage.textContent = "Login successful! Redirecting...";
            
            setTimeout(() => {
                window.location.href = "home.html"; // Redirect after 1.5 seconds
            }, 1500);
        } else {
            loginMessage.style.color = "red";
            loginMessage.textContent = data.message || "Invalid credentials.";
        }
    } catch (error) {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Server error. Please try again.";
        console.error("Login Error:", error);
    }
}

// FETCH USER PROFILE
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
            headers: { "Authorization": `Bearer ${token}` } // Fixed missing 'Bearer' prefix
        });

        const data = await res.json();
        if (res.ok) {
            document.getElementById("username").innerText = data.username;
            // Update profile icon if user has a custom picture:
            if (data.profilePicture) {
                document.getElementById("profileIconImg").src = data.profilePicture;
            }
        } else {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "login.html";
        }
    } catch (error) {
        alert("Error fetching profile. Please try again.");
        console.error("Profile Fetch Error:", error);
    }
}

// LOGOUT FUNCTION
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}


// Existing functions: registerUser, loginUser, loadProfile, logout, etc.

// --- Post Creation Functionality ---

// Function to create a new post (with optional image)
async function createPost(event) {
    event.preventDefault();
    const content = document.getElementById("post-content").value;
    const imageInput = document.getElementById("post-image").files[0];

    const formData = new FormData();
    formData.append("content", content);
    if (imageInput) formData.append("image", imageInput);

    const token = localStorage.getItem("token"); // Get the token from storage

    if (!token) {
        alert("You must be logged in to create a post.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("Post created successfully!");
            document.getElementById("post-form").reset();
            closeModal();
            fetchPosts(); // Refresh posts
        } else {
            alert(data.message || "Error creating post.");
        }
    } catch (error) {
        console.error("Error creating post:", error);
    }
}


document.getElementById("post-form").addEventListener("submit", createPost);



// --- Modal Handling ---

const uploadIcon = document.getElementById("uploadIcon");
const postModal = document.getElementById("postModal");
const closeModalBtn = document.querySelector("#postModal .close");

// Show modal when + icon is clicked
uploadIcon.addEventListener("click", (e) => {
    e.preventDefault();
    postModal.style.display = "flex";
});

// Close modal when user clicks on <span> (x)
closeModalBtn.addEventListener("click", () => {
    postModal.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === postModal) {
        postModal.style.display = "none";
    }
});

async function fetchPosts() {
    const token = localStorage.getItem("token");
    console.log("Token: ", token);  // Check if the token is available

    if (!token) {
        console.error("No token found. Please log in.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        console.log("Full API Response:", data); // Debugging

        if (!res.ok) {
            console.error(data.message || "Error fetching posts.");
            return;
        }

        // Ensure `posts` is available and is an array
        if (!data || !Array.isArray(data.posts)) {
            console.error("Unexpected API response format:", data);
            return;
        }

        displayPosts(data.posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}


async function deletePost(postId) {
    // Retrieve and trim the token from localStorage
    const token = localStorage.getItem("token");
    const trimmedToken = token ? token.trim() : "";
    console.log("Token for delete:", trimmedToken);  // Log the token to check it

    if (!trimmedToken) {
        alert("You must be logged in to delete a post.");
        return;
    }
  
    try {
        const res = await fetch(`${API_URL}/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${trimmedToken}`  // Use the trimmed token here
            }
        });
        const data = await res.json();
        console.log("Delete response:", data);  // Log the response for debugging

        if (res.ok) {
            alert("Post deleted successfully!");
            fetchPosts(); // Refresh posts after deletion
        } else {
            alert(data.message || "Error deleting post.");
        }
    } catch (error) {
        console.error("Error deleting post:", error);
    }
}


function displayPosts(posts) {
    const postsContainer = document.getElementById("postsContainer");
    postsContainer.innerHTML = ""; // Clear existing posts before appending
    const currentUser = localStorage.getItem("username");
    console.log("Current User: ", currentUser);  // Check if the username is correct

    posts.forEach(post => {
        console.log("Post Image URL:", post.image); // Debugging
        
        // Ensure full image URL
        const imageUrl = post.image 
            ? (post.image.startsWith("/") ? `${API_URL}${post.image}` : `${API_URL}/${post.image}`)
            : null;

        const postElement = document.createElement("div");
        postElement.classList.add("post");

        postElement.innerHTML = `
        <div class="post-header">
            <img class="post-dp" src="${post.author.profilePicture || 'https://www.w3schools.com/howto/img_avatar.png'}" alt="User DP" />
            <span class="post-username">${post.author.username || "Anonymous"}</span>
            <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
            <button class="follow-btn">Follow</button>
            <!-- Three-dot menu for delete functionality -->
            <div class="post-options">
                <i class="fas fa-ellipsis-h options-icon"></i>
                <div class="options-menu" style="display: none;">
                    <button class="delete-btn" data-id="${post._id}" style="display: ${post.author.username.toLowerCase().trim() === currentUser.toLowerCase().trim() ? 'inline-block' : 'none'}">Delete</button>
                </div>
            </div>
        </div>
        <div class="post-comment">${post.content}</div>
        ${imageUrl ? `<div class="card" style="background-image: url('${imageUrl}');"></div>` : ""}
        <div class="post-footer">
            <button class="like-btn"><i class="fas fa-thumbs-up"></i></button>
            <button class="dislike-btn"><i class="fas fa-thumbs-down"></i></button>
            <button class="comment-btn"><i class="fas fa-comment"></i></button>
        </div>
    `;

        postsContainer.prepend(postElement);

        // Toggle the options menu on icon click
        const optionsIcon = postElement.querySelector(".options-icon");
        const optionsMenu = postElement.querySelector(".options-menu");
        optionsIcon.addEventListener("click", () => {
            optionsMenu.style.display = optionsMenu.style.display === "block" ? "none" : "block";
        });

        // Attach event listener to the delete button if it exists
        const deleteBtn = postElement.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                if (confirm("Are you sure you want to delete this post?")) {
                    await deletePost(post._id);
                }
            });
        }
    });
}




// Call fetchPosts when the page loads
window.addEventListener("DOMContentLoaded", fetchPosts);

// Optional: function to close the modal (can be reused)
function closeModal() {
    postModal.style.display = "none";
}

// document.getElementById("profileIcon").addEventListener("click", async () => {
//     const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");

//     if (confirmDelete) {
//         try {
//             const token = localStorage.getItem("token"); // Get user's token

//             const res = await fetch(`${API_URL}/auth/delete`, {
//                 method: "DELETE",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 }
//             });

//             const data = await res.json();
//             if (res.ok) {
//                 alert("Account deleted successfully.");
//                 localStorage.clear(); // Remove user data
//                 window.location.href = "register.html"; // Redirect to registration page
//             } else {
//                 alert(data.message || "Error deleting account.");
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             alert("Something went wrong. Please try again.");
//         }
//     }
// });

// Toggle the dropdown when clicking the profile icon
document.getElementById("profileIcon").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("profileDropdown").classList.toggle("active");
  });
  
  // Redirect to profile page when clicking "Profile Info"
  document.getElementById("profileOption").addEventListener("click", (event) => {
    event.preventDefault();
    // Optionally close the dropdown
    document.getElementById("profileDropdown").classList.remove("active");
    // Redirect to the profile page
    window.location.href = "profile.html";
  });
  

document.getElementById("deleteAccount").addEventListener("click", async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/user/profile`, {  // Updated endpoint if needed
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
                window.location.href = "register.html"; // Redirect to registration page after deletion
            } else {
                alert(data.message || "Error deleting account.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "login.html";
      });
    } else {
      console.warn("Logout button not found on this page.");
    }
  });
  
  window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Update the profile picture on the home page dynamically
        const profileIconImg = document.getElementById("profileIconImg");
        if (profileIconImg && data.profilePicture) {
          profileIconImg.src = data.profilePicture;
        }
      } else {
        console.error("Error fetching profile info");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
  




