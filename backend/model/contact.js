const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: ["general", "support", "bug", "feature", "business", "other"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional - user might not be logged in
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Admin/moderator assigned to handle this contact
    },
    notes: [
      {
        note: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: {
      type: Date,
      required: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ category: 1, status: 1 });
contactSchema.index({ assignedTo: 1, status: 1 });
contactSchema.index({ email: 1 });

// Virtual for formatted date
contactSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Ensure virtual fields are serialized
contactSchema.set("toJSON", { virtuals: true });
contactSchema.set("toObject", { virtuals: true });

// Pre-save middleware to set priority based on category
contactSchema.pre("save", function (next) {
  if (this.isNew) {
    // Set priority based on category
    switch (this.category) {
      case "bug":
        this.priority = "high";
        break;
      case "urgent":
        this.priority = "urgent";
        break;
      case "business":
        this.priority = "medium";
        break;
      default:
        this.priority = "medium";
    }
  }
  next();
});

// Static method to get contact statistics
contactSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryStats = await this.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await this.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    byStatus: stats,
    byCategory: categoryStats,
    byPriority: priorityStats,
  };
};

// Instance method to add a note
contactSchema.methods.addNote = function (note, userId) {
  this.notes.push({
    note,
    addedBy: userId,
  });
  return this.save();
};

// Instance method to resolve contact
contactSchema.methods.resolve = function (userId) {
  this.status = "resolved";
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  return this.save();
};

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
