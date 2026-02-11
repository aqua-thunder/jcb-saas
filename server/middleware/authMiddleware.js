const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;
  console.log("Auth Middleware Hit:", req.originalUrl);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token found:", token ? "Yes" : "No");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded ID:", decoded.id);
      req.user = decoded.id;
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "No token, access denied" });
  }
};

module.exports = protect;
