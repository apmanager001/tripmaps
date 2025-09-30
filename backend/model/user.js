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
  // OAuth fields
  oauthProvider: {
    type: String,
    enum: ["google", "facebook", null],
    default: null,
  },
  oauthId: {
    type: String,
    default: null,
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
  // Social media links
  socialMedia: {
    facebook: {
      type: String,
      default: null,
    },
    instagram: {
      type: String,
      default: null,
    },
    tiktok: {
      type: String,
      default: null,
    },
    youtube: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    linkedin: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    twitch: {
      type: String,
      default: null,
    },
    discord: {
      type: String,
      default: null,
    },
    linktree: {
      type: String,
      default: null,
    },
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
  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  // Email verification fields
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  // Alert settings
  alertSettings: {
    followAlerts: {
      type: Boolean,
      default: true,
    },
    commentAlerts: {
      type: Boolean,
      default: true,
    },
    likeAlerts: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    emailFollowAlerts: {
      type: Boolean,
      default: true,
    },
    emailCommentAlerts: {
      type: Boolean,
      default: true,
    },
  },
  // Visited countries
  visitedCountries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
