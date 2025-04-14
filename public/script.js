const API_URL = "https://inno-vent-server.vercel.app"; // Replace with your backend deployment URL
 // Duplicate declaration removed
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifier, password }),
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
                // Ensure full image URL for profile picture
                const profilePicUrl = data.profilePicture.startsWith('http') 
                    ? data.profilePicture 
                    : `${API_URL}${data.profilePicture.startsWith('/') ? '' : '/'}${data.profilePicture}`;
                
                document.getElementById("profileIconImg").src = profilePicUrl;
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

    posts.forEach(post => {
        const imageUrl = post.image 
            ? (post.image.startsWith('http') ? post.image : `${API_URL}${post.image.startsWith('/') ? '' : '/'}${post.image}`)
            : null;
        
        const profilePicUrl = post.author && post.author.profilePicture 
            ? (post.author.profilePicture.startsWith('http') ? post.author.profilePicture : `${API_URL}${post.author.profilePicture.startsWith('/') ? '' : '/'}${post.author.profilePicture}`)
            : 'https://www.w3schools.com/howto/img_avatar.png';
        
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        postElement.innerHTML = `
        <div class="post-header">
            <img class="post-dp" src="${profilePicUrl}" alt="User DP" />
            <span class="post-username">${post.author?.username || "Anonymous"}</span>
            <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
            <button class="follow-btn">Follow</button>
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
            <button class="like-btn"><i class="fas fa-thumbs-up"></i> <span class="like-count">${Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}</span></button>
            <button class="dislike-btn"><i class="fas fa-thumbs-down"></i> <span class="dislike-count">${Array.isArray(post.dislikes) ? post.dislikes.length : (post.dislikes || 0)}</span></button>
            <button class="comment-btn"><i class="fas fa-comment"></i></button>
        </div>
        `;

        postsContainer.prepend(postElement);

        // Toggle options menu
        const optionsIcon = postElement.querySelector(".options-icon");
        const optionsMenu = postElement.querySelector(".options-menu");
        optionsIcon.addEventListener("click", () => {
            optionsMenu.style.display = optionsMenu.style.display === "block" ? "none" : "block";
        });

        // Delete post
        const deleteBtn = postElement.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                if (confirm("Are you sure you want to delete this post?")) {
                    await deletePost(post._id);
                }
            });
        }

        // Like/Dislike functionality
        const likeBtn = postElement.querySelector(".like-btn");
        const dislikeBtn = postElement.querySelector(".dislike-btn");
        const likeCount = postElement.querySelector(".like-count");
        const dislikeCount = postElement.querySelector(".dislike-count");

        likeBtn.addEventListener("click", async () => {
            const updatedPost = await updateLikeDislike(post._id, "like");
            if (updatedPost) {
                likeCount.textContent = Array.isArray(updatedPost.likes) ? updatedPost.likes.length : updatedPost.likes;
                dislikeCount.textContent = Array.isArray(updatedPost.dislikes) ? updatedPost.dislikes.length : updatedPost.dislikes;
            }
        });
        
        dislikeBtn.addEventListener("click", async () => {
            const updatedPost = await updateLikeDislike(post._id, "dislike");
            if (updatedPost) {
                likeCount.textContent = Array.isArray(updatedPost.likes) ? updatedPost.likes.length : updatedPost.likes;
                dislikeCount.textContent = Array.isArray(updatedPost.dislikes) ? updatedPost.dislikes.length : updatedPost.dislikes;
            }
        });
        
        // Comment modal functionality
        const commentBtn = postElement.querySelector(".comment-btn");
        commentBtn.addEventListener("click", () => {
            // Open the modal and populate it with the post's comments
            openCommentModal(post);
        });
    });
}


async function postComment(postId, comment) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ comment })
        });
        if (!response.ok) throw new Error("Failed to post comment");
        return await response.json(); // expecting the updated post with comments
    } catch (error) {
        console.error("Error posting comment:", error);
    }
}



async function openCommentModal(post) {
    const modal = document.getElementById("commentModal");
    const modalClose = modal.querySelector(".close");
    const commentsList = modal.querySelector(".comments-list");
    const commentForm = modal.querySelector("#modal-comment-form");

    // Function to fetch the latest post data (with comments) from the API.
    async function fetchLatestPost() {
        try {
            const res = await fetch(`${API_URL}/posts/${post._id}`);
            if (!res.ok) throw new Error("Failed to fetch post");
            return await res.json();
        } catch (error) {
            console.error("Error fetching post:", error);
            return null;
        }
    }

    // Render comments with the three dots (delete options) inline beside the username and time.
    const renderComments = (comments) => {
        if (comments && comments.length > 0) {
            return comments
                .map((comment) => {
                    const currentUser = (localStorage.getItem("username") || "").toLowerCase().trim();
                    let deleteOption = "";
                    // Display options if the comment belongs to the logged-in user.
                    if (comment.username.toLowerCase().trim() === currentUser) {
                        deleteOption = `
                            <span class="comment-options" style="margin-left: auto; cursor: pointer;">
                                <i class="fas fa-ellipsis-v options-icon"></i>
                                <div class="options-menu" style="display: none; position: absolute; background: #fff; border: 1px solid #ccc; padding: 5px;">
                                    <button class="delete-comment-btn" data-id="${comment._id}">Delete</button>
                                </div>
                            </span>
                        `;
                    }
                    return `
                        <div class="comment" data-id="${comment._id}" style="position: relative; padding: 5px 0;">
                            <div class="comment-header" style="display: flex; align-items: center;">
                                <div class="comment-info">
                                    <strong>${comment.username}</strong>
                                    <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                                ${deleteOption}
                            </div>
                            <p>${comment.content}</p>
                        </div>
                    `;
                })
                .join('');
        }
        return "<p>No comments yet.</p>";
    };
    
    // Try to fetch the latest post data; if not available, fall back to our local post.
    let latestPost = await fetchLatestPost();
    if (!latestPost || !latestPost.comments) {
        latestPost = post;
    }
    commentsList.innerHTML = renderComments(latestPost.comments);

    // Function to attach event listeners for the delete option.
    function addDeleteListeners() {
        // Attach event listeners for the three-dot icon.
        const optionsIcons = commentsList.querySelectorAll(".options-icon");
        optionsIcons.forEach(icon => {
            icon.addEventListener("click", function(e) {
                // Toggle the options menu next to the icon.
                const optionsMenu = this.nextElementSibling;
                optionsMenu.style.display = optionsMenu.style.display === "block" ? "none" : "block";
                e.stopPropagation();
            });
        });

        // Attach listeners to delete buttons.
        const deleteBtns = commentsList.querySelectorAll(".delete-comment-btn");
deleteBtns.forEach(btn => {
    // Inside your delete comment event listener:
btn.addEventListener("click", async function(e) {
    const commentId = this.getAttribute("data-id");
    // Confirm deletion.
    if (confirm("Are you sure you want to delete this comment?")) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${API_URL}/posts/${post._id}/comment/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            if (!response.ok) throw new Error("Failed to delete comment");
            
            // Update both variables to remove the deleted comment
            latestPost.comments = latestPost.comments.filter(c => c._id !== commentId);
            // Also update the original post state to keep them in sync.
            if(post.comments){
                post.comments = post.comments.filter(c => c._id !== commentId);
            }

            commentsList.innerHTML = renderComments(latestPost.comments);
            addDeleteListeners();
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Error deleting comment.");
        }
    }
    e.stopPropagation();
});

});

    }

    // Attach deletion event listeners to the rendered comments.
    addDeleteListeners();

    // Show the modal.
    modal.style.display = "block";

    // Clone the comment form to avoid duplicate event listeners.
    const newForm = commentForm.cloneNode(true);
    commentForm.parentNode.replaceChild(newForm, commentForm);

    // Add submit event listener for posting a new comment.
    // Add comment submit handler remains similar:
newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = newForm.querySelector('input[name="comment"]');
    const commentText = input.value.trim();
    if (commentText === "") return;

    const updatedPost = await postComment(post._id, commentText);
    if (updatedPost && updatedPost.comment) {
        // Update both arrays so that old deleted comments are not carried over.
        if (!post.comments) {
            post.comments = [];
        }
        post.comments.push(updatedPost.comment); // includes _id!
        
        // Synchronize latestPost with post
        latestPost.comments = [...post.comments];
        
        commentsList.innerHTML = renderComments(latestPost.comments);
        addDeleteListeners();
        input.value = "";
    }
});


    // Close modal when clicking the close button.
    modalClose.onclick = () => (modal.style.display = "none");
    // Also close the modal if the user clicks outside it.
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };

    // Close any open options menus when clicking elsewhere.
    window.addEventListener("click", () => {
        const menus = commentsList.querySelectorAll(".options-menu");
        menus.forEach(menu => {
            menu.style.display = "none";
        });
    });
}



// Call fetchPosts when the page loads
window.addEventListener("DOMContentLoaded", fetchPosts);

// Optional: function to close the modal (can be reused)
function closeModal() {
    postModal.style.display = "none";
}

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
  
// Updated function to load profile data and update UI elements
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
          // Make sure the profile picture URL is complete
          const profilePicUrl = data.profilePicture.startsWith('http') 
            ? data.profilePicture 
            : `${API_URL}${data.profilePicture.startsWith('/') ? '' : '/'}${data.profilePicture}`;
          
          console.log("Setting profile picture to:", profilePicUrl);
          profileIconImg.src = profilePicUrl;
        }
      } else {
        console.error("Error fetching profile info:", data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
});

async function handleLike(postId, isLiked) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to like posts.");
        return;
    }

    try {
        // Determine the action based on current state
        const action = isLiked ? 'unlike' : 'like';
        
        const res = await fetch(`${API_URL}/posts/${postId}/${action}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();
        
        if (res.ok) {
            // Update UI without reloading the whole posts feed
            const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
            if (postElement) {
                const likeBtn = postElement.querySelector(".like-btn");
                const likeCount = postElement.querySelector(".like-count");
                const dislikeBtn = postElement.querySelector(".dislike-btn");
                
                // Toggle active state
                if (action === 'like') {
                    likeBtn.classList.add('active');
                    // If user dislikes and then likes, remove dislike
                    dislikeBtn.classList.remove('active');
                } else {
                    likeBtn.classList.remove('active');
                }
                
                // Update count
                likeCount.textContent = data.likes ? data.likes.length : 0;
                
                // Update dislike count if it changed (e.g., when a dislike is removed upon liking)
                if (data.dislikes) {
                    const dislikeCount = postElement.querySelector(".dislike-count");
                    dislikeCount.textContent = data.dislikes.length;
                }
            }
        } else {
            console.error(data.message || "Failed to update like status");
        }
    } catch (error) {
        console.error("Error liking post:", error);
    }
}

async function handleDislike(postId, isDisliked) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to dislike posts.");
        return;
    }

    try {
        // Determine the action based on current state
        const action = isDisliked ? 'undislike' : 'dislike';
        
        const res = await fetch(`${API_URL}/posts/${postId}/${action}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();
        
        if (res.ok) {
            // Update UI without reloading the whole posts feed
            const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
            if (postElement) {
                const dislikeBtn = postElement.querySelector(".dislike-btn");
                const dislikeCount = postElement.querySelector(".dislike-count");
                const likeBtn = postElement.querySelector(".like-btn");
                
                // Toggle active state
                if (action === 'dislike') {
                    dislikeBtn.classList.add('active');
                    // If user likes and then dislikes, remove like
                    likeBtn.classList.remove('active');
                } else {
                    dislikeBtn.classList.remove('active');
                }
                
                // Update count
                dislikeCount.textContent = data.dislikes ? data.dislikes.length : 0;
                
                // Update like count if it changed (e.g., when a like is removed upon disliking)
                if (data.likes) {
                    const likeCount = postElement.querySelector(".like-count");
                    likeCount.textContent = data.likes.length;
                }
            }
        } else {
            console.error(data.message || "Failed to update dislike status");
        }
    } catch (error) {
        console.error("Error disliking post:", error);
    }
}

async function updateLikeDislike(postId, action) {
    const endpoint = `${API_URL}/posts/${postId}/${action}`;
    console.log("Calling endpoint:", endpoint);
    try {
        const response = await fetch(endpoint, {
            method: "PUT", // Make sure this verb matches your backend implementation
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) throw new Error("Failed to update post");
        return await response.json(); // Return the updated post object
    } catch (error) {
        console.error("Error updating like/dislike:", error);
    }
}

