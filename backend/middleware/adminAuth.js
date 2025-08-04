const User = require("../model/user");

exports.adminAuth = async (req, res, next) => {
  try {
    // First ensure user is authenticated via jwtAuth
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user with role information
    const user = await User.findById(req.user._id).select("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has admin role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Add user role to request for use in controllers
    req.user.role = user.role;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
