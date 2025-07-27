const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      success: false,
      message: "Username must be between 3 and 20 characters",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  next();
};

const validateMapData = (req, res, next) => {
  const { coordArray, mapName } = req.body;

  if (!coordArray || !Array.isArray(coordArray)) {
    return res.status(400).json({
      success: false,
      message: "Coordinates array is required",
    });
  }

  if (!mapName || mapName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Map name is required",
    });
  }

  // Validate coordinates
  for (const coord of coordArray) {
    if (typeof coord.lat !== "number" || typeof coord.lng !== "number") {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates format",
      });
    }
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateMapData,
};
