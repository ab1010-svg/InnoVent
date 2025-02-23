// routes/posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/auth"); // Auth middleware

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

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Store uploads in the "uploads" folder
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        // Create a unique filename with timestamp
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST route to create a post (with optional image)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
    try {
        const { content } = req.body;
        let imageUrl = null;
        if (req.file) {
            // You can store the relative path of the file
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

// GET route to fetch all posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username").sort({ createdAt: -1 });
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE post route
router.delete("/:id", authenticate, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      // Verify ownership
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
  
module.exports = router;
