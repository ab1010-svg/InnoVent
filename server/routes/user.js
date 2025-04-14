const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");



// Configure multer storage (you can also use cloud storage like AWS S3)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profilePictures/");
  },
  filename: function (req, file, cb) {
    // Prepend the user ID and timestamp for uniqueness
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + "-" + uniqueSuffix + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Endpoint to update profile picture
router.put("/profilePicture", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    // Construct the full URL for the uploaded profile picture
    const profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/profilePictures/${req.file.filename}`;

    // Update the user's profile picture in the database
    await User.findByIdAndUpdate(req.user.id, { profilePicture: profilePictureUrl });

    res.json({ message: "Profile picture updated successfully", profilePicture: profilePictureUrl });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user.profilePicture) {
      user.profilePicture = process.env.DEFAULT_PROFILE_PICTURE_URL || '/uploads/profilePictures/default.png';
    }
    res.json(user);
    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete User Account
router.delete("/profile", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
