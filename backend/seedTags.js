const mongoose = require("mongoose");
const Tag = require("./model/tag");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/mytripmaps")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const defaultTags = [
  "Restaurant",
  "Cafe",
  "Hotel",
  "Park",
  "Museum",
  "Beach",
  "Historic",
  "Shopping",
  "Entertainment",
  "Transportation",
];

async function seedTags() {
  try {
    console.log("Starting to seed tags...");

    // Clear existing tags
    await Tag.deleteMany({});
    console.log("Cleared existing tags");

    // Add new basic tags
    for (const tagName of defaultTags) {
      const newTag = new Tag({ name: tagName });
      await newTag.save();
      console.log(`Created tag: ${tagName}`);
    }

    console.log("Tag seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding tags:", error);
    process.exit(1);
  }
}

seedTags();
