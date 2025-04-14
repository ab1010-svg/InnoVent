// models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    content: { type: String },
    image: { type: String }, // URL/path of the uploaded image (optional)
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // New fields for like/dislike functionality
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
            content: String,
            username: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
    
    
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
