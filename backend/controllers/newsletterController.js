const Newsletter = require("../model/newsletter");

// POST /newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    // Check for duplicate
    const exists = await Newsletter.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ error: "Email already subscribed" });
    }
    await Newsletter.create({ email });
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


// GET /newsletter
exports.getAllNewsletter = async (req, res) => {
  try {
    const newsletters = await Newsletter.find({});
    res.status(200).json(newsletters);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
