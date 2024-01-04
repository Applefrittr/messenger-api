const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    password: { type: String, requried: true },
    avatar: { type: String },
    userSince: Date,
    personal: { type: String, trim: true, maxLength: 300 },
    realName: { type: String },
    birthday: { type: String },
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    country: { type: String },
    requestIn: [{ type: Schema.Types.ObjectId, ref: "User" }],
    requestOut: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    online: { type: Boolean },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

UserSchema.virtual("userSince_string").get(function () {
  return DateTime.fromJSDate(this.userSince).toLocaleString(DateTime.DATE_FULL);
});

module.exports = mongoose.model("User", UserSchema);
