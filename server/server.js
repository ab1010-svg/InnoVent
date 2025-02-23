require("dotenv").config(); // Load environment variables from .env

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/user", require("./routes/user"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Import routes
app.use("/auth", require("./routes/auth"));
// In server.js, after your other routes...
app.use("/posts", require("./routes/posts"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB Atlas using the connection string from the .env file
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));
