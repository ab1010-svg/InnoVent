// models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    content: { type: String },
    image: { type: String }, // URL/path of the uploaded image (optional)
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
