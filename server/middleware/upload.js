const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 5001;

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
  },
});

// Initialize Multer
const upload = multer({ storage: storage });

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));

// Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  res.json({ msg: "File uploaded successfully", filePath: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});