// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post"); // If you want to delete posts too
const adminAuth = require("../middleware/adminAuth"); // Your middleware to ensure only admins can run this

// Delete a user and optionally their posts
router.delete("/user/:id", adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Option A: Cascade Delete - Remove posts as well
    await Post.deleteMany({ user: userId });
    
    // Option B: Or, if you do not want to delete posts, update them to mark the author as deleted
    // For example:
    // await Post.updateMany({ user: userId }, { $set: { author: null } });
    
    // Then delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User account and associated posts deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error. Unable to delete user." });
  }
});

module.exports = router;
// In routes/admin.js (or a separate file)
// Ensure this route is protected with your adminAuth middleware
router.get("/users", adminAuth, async (req, res) => {
    try {
      // Return a list of users with minimal info (e.g., id, username, email)
      const users = await User.find({}, "username email _id");
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  });
  