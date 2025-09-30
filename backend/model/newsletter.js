const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsletterSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Newsletter", newsletterSchema);
