const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/auth"); // Auth middleware
const User = require("../models/User");
const mongoose = require("mongoose"); // Add this at the top if not already

// Authentication middleware (as before)
const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contains user id
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

// Multer config
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Create a post
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
    try {
        const { content } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        if (!content && !imageUrl) {
            return res.status(400).json({ message: "Content or image is required" });
        }

        const newPost = new Post({
            content,
            image: imageUrl,
            author: req.user.id,
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username profilePicture")
            .where("author").ne(null)
            .sort({ createdAt: -1 });

        res.json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a post
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Like a post
router.put("/:id/like", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user.id;

        if (!post) return res.status(404).json({ message: "Post not found" });

        // If user already liked, remove like
        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
            post.dislikes.pull(userId); // Remove dislike if exists
        }

        await post.save();
        res.json({ message: "Post liked/unliked", likes: post.likes.length, dislikes: post.dislikes.length });
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Dislike a post
router.put("/:id/dislike", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user.id;

        if (!post) return res.status(404).json({ message: "Post not found" });

        // If user already disliked, remove dislike
        if (post.dislikes.includes(userId)) {
            post.dislikes.pull(userId);
        } else {
            post.dislikes.push(userId);
            post.likes.pull(userId); // Remove like if exists
        }

        await post.save();
        res.json({ message: "Post disliked/undisliked", likes: post.likes.length, dislikes: post.dislikes.length });
    } catch (error) {
        console.error("Error disliking post:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add this route in routes/posts.js after the existing routes

// Post a comment on a post

router.post("/:id/comment", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const { comment } = req.body;
        if (!comment || comment.trim() === "") {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const user = await User.findById(req.user.id);
        const username = user && user.username ? user.username : "Anonymous";

        // 🛠️ Generate a comment with _id and createdAt
        const newComment = {
            _id: new mongoose.Types.ObjectId(),
            content: comment,
            username,
            createdAt: new Date()
        };

        // ✅ Push full comment object
        post.comments.push(newComment);
        await post.save();

        // ✅ Respond with new comment
        res.status(201).json({ message: "Comment posted successfully", comment: newComment });
    } catch (error) {
        console.error("Error posting comment:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Get comments for a specific post
router.get("/:postId/comments", async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        res.json(post.comments); // assuming comments is an array in Post schema
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a comment from a post
router.delete("/:postId/comment/:commentId", authMiddleware, async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Optional: check if current user is the owner of the comment
        const user = await User.findById(req.user.id);
        if (comment.username !== user.username) {
            return res.status(403).json({ message: "Unauthorized to delete this comment" });
        }

        // Remove the comment
        post.comments.pull(commentId);
        await post.save();

        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Server error" });
    }
});




// In routes/posts.js
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "username profilePicture");
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
