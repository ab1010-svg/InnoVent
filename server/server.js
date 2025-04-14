require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== Middleware =====
app.use(express.json()); // To parse JSON bodies
app.use(cors()); // Enable CORS for frontend requests

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Routes =====
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user")); // Keep only this one for user routes
app.use("/posts", require("./routes/posts")); // This is what we need for like/dislike to work
app.use("/admin", require("./routes/admin"));

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ===== Remove server.listen for Vercel =====
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ===== Export the app =====
module.exports = app;
