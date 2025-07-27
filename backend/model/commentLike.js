const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema(
  {
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MapComment",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("CommentLike", commentLikeSchema);
