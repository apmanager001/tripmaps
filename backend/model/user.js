const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please provide an unique Email"],
    unique: [true, "This email is already registered"],
  },
  emailPrivate: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "Please provide a Password"],
    unique: false,
  },
  username: {
    type: String,
    required: [true, "Please provide an unique Username"],
    unique: [true, "This email is already registered"],
  },
  role: {
    type: String,
    enum: ["member", "admin", "moderator"],
    default: "member",
    required: true
  },
  bio: {
    type: String,
    
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model("User" , userSchema)

module.exports = UserModel