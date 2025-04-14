const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied" });
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid Token format" });
    }
    const token = tokenParts[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;  // Ensure verified includes username, or fetch it separately if needed
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};
