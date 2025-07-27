const jwt = require("jsonwebtoken");

exports.jwtAuth = (req, res, next) => {
  const { tripMaps: token } = req.cookies;

  if (!token) {
    console.log("No tripMaps cookie found");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log("JWT verification failed:", err.message);
        res.clearCookie("tripMaps");
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Ensure user object has _id for consistency
      if (user.id) {
        user._id = user.id;
      }

      req.user = user; // Attach user data to the request object
      next(); // Proceed to the next middleware or route handler
    });
  } catch (err) {
    console.log("JWT middleware error:", err.message);
    res.clearCookie("tripMaps");
    return res.status(401).json({ message: "Unauthorized" });
  }
};
