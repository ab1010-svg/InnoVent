const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String, default: "No caption" },
  username: { type: String, default: "Anonymous" }, // ✅ Ensure username is stored
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", ImageSchema);
