const mongoose = require("mongoose");
const { Schema } = mongoose;

const countrySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  flagUrl: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Country", countrySchema);