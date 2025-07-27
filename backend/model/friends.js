const mongoose = require("mongoose");
const { Schema } = mongoose;

// const friendSchema = new Schema({
//   owner: { type: Schema.Types.ObjectId, ref: "User", required: true }, // the user who owns this friend list
//   friend: { type: Schema.Types.ObjectId, ref: "User", required: true }, // their actual friend
//   createdDate: { type: Date, default: Date.now },
// });

// const FriendModel = mongoose.model("Friend", friendSchema);
// module.exports = FriendModel;


const friendSchema = new mongoose.Schema(
  {
    following_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followed_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Friend", friendSchema);
