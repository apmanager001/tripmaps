const mongoose = require("mongoose");
const { Schema } = mongoose;

const dashSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please provide an unique Email"],
    unique: [true, "This email is already registered"],
  },
  username: {
    type: String,
    required: [true, "Please provide an unique Username"],
    unique: [true, "This email is already registered"],
  },
  role: { type: String, default: "member" },
  createdDate: { type: String },
});

const DashModel = mongoose.model("User", dashSchema);

module.exports = DashModel;
