const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const newPost = new Post({
      user: user._id,
      imageUrl: `/uploads/${req.file.filename}`,
      comment: req.body.comment,
    });

    await newPost.save();
    res.status(201).json({ msg: "Image uploaded successfully", post: newPost });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ msg: "Upload failed" });
  }
});

module.exports = router;