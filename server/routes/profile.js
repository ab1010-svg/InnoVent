

const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Get Profile
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Profile
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
