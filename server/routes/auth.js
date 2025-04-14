const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middleware/auth"); // Middleware to verify JWT

router.delete("/delete", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete user from database
        await User.findByIdAndDelete(userId);

        res.json({ message: "Account deleted successfully." });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Server error. Unable to delete account." });
    }
});


// Register Route
// Register Route
router.post("/register", async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        console.log("Registering user:", { fullName, username, email });

        // Ensure all required fields are present
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the username or email is already taken
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ fullName, username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Login Route (Modified to use identifier: email or username)
// Login Route (Modified to use identifier: email or username)
router.post("/login", async (req, res) => {
    try {
        const { identifier, password } = req.body;
        let user;

        // Determine whether the identifier is an email or username
        if (identifier.includes("@")) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ username: identifier });
        }

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // ✅ Include username in the token payload
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Return the token and user info
        res.json({ token, userId: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
