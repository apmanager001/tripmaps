const Tag = require("../model/tag");

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create a new tag
const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required",
      });
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.trim() });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Tag already exists",
      });
    }

    const newTag = new Tag({ name: name.trim() });
    const savedTag = await newTag.save();

    res.status(201).json({
      success: true,
      data: savedTag,
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllTags,
  createTag,
};
