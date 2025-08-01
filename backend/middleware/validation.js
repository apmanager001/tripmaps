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

// Contact form validation function
const validateContact = (data) => {
  const errors = [];

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (data.name.trim().length > 100) {
    errors.push("Name cannot exceed 100 characters");
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || data.email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!emailRegex.test(data.email)) {
    errors.push("Please provide a valid email address");
  }

  // Validate subject
  if (!data.subject || data.subject.trim().length === 0) {
    errors.push("Subject is required");
  } else if (data.subject.trim().length > 200) {
    errors.push("Subject cannot exceed 200 characters");
  }

  // Validate message
  if (!data.message || data.message.trim().length === 0) {
    errors.push("Message is required");
  } else if (data.message.trim().length > 2000) {
    errors.push("Message cannot exceed 2000 characters");
  }

  // Validate category (optional)
  if (
    data.category &&
    !["general", "support", "bug", "feature", "business", "other"].includes(
      data.category
    )
  ) {
    errors.push("Invalid category selected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateMapData,
  validateContact,
};
