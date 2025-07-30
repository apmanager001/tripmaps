const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    required: true,
  },
  bio: {
    type: String,
  },
  // Profile picture fields
  profilePicture: {
    s3Key: {
      type: String,
      default: null,
    },
    thumbnailKey: {
      type: String,
      default: null,
    },
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  // Subscription fields
  stripeCustomerId: {
    type: String,
    default: null,
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  subscriptionStatus: {
    type: String,
    enum: ["inactive", "active", "past_due", "canceled", "unpaid"],
    default: "inactive",
  },
  currentPeriodEnd: {
    type: Date,
    default: null,
  },
  lastPaymentDate: {
    type: Date,
    default: null,
  },
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
