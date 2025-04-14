const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Middleware to ensure profile picture URL is always present
const ensureProfilePicture = (req, res, next) => {
  if (res.locals.userData && !res.locals.userData.profilePicture) {
    // Set default profile picture if none exists
    res.locals.userData.profilePicture = process.env.DEFAULT_PROFILE_PICTURE_URL || 
      '/uploads/profilePictures/default.png';
  }
  next();
};

// Apply middleware to relevant routes
router.use('/:id', ensureProfilePicture);

// Get Profile
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        
        // Set in locals for middleware processing
        res.locals.userData = user;
        
        // If profile picture is missing, add default (middleware might not have run yet)
        if (!user.profilePicture) {
            user.profilePicture = process.env.DEFAULT_PROFILE_PICTURE_URL || 
                '/uploads/profilePictures/default.png';
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Profile
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Ensure profile picture exists in response
        if (!updatedUser.profilePicture) {
            updatedUser.profilePicture = process.env.DEFAULT_PROFILE_PICTURE_URL || 
                '/uploads/profilePictures/default.png';
        }
        
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;