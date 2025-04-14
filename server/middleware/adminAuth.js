// middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  // Expect token in Authorization header in format "Bearer <token>"
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = tokenParts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Option A: If you encoded role information in the token,
    // you can check the role directly:
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    // Option B: If your token only contains the user id,
    // fetch the user from the database and check the role:
    // const user = await User.findById(decoded.id);
    // if (!user || user.role !== "admin") {
    //   return res.status(403).json({ message: "Admin access required" });
    // }
    // req.user = user; // you might save it in req.user for later use

    next(); // User is admin, allow access
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
