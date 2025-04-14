require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ===== Middleware =====
app.use(express.json());              // parse JSON bodies
app.use(cors());                      // enable CORS for all routes

// Serve uploaded images (profile pics, post images)
// Note: uploads directory lives in server/uploads
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));

// ===== Routes =====
// Auth routes (register, login)
app.use('/auth', require('../server/routes/auth'));

// User routes (profile, delete account, etc.)
app.use('/user', require('../server/routes/user'));

// Posts routes (create, read, update, delete, like/dislike)
app.use('/posts', require('../server/routes/posts'));

// Admin routes (if any)
app.use('/admin', require('../server/routes/admin'));

// ===== MongoDB Connection =====
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI environment variable not set');
} else {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// ===== Export for Vercel Serverless =====
// Vercel will use this app as a serverless function entrypoint
module.exports = app;
