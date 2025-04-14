// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: {
    type: String,
    default: process.env.DEFAULT_PROFILE_PICTURE_URL || '/uploads/profilePictures/default.jpg'
  },
  role: {
    type: String,
    default: "user" // for regular users; change to "admin" for admin accounts
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
