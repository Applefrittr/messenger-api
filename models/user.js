const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    password: { type: String, requried: true },
    avatar: { type: String },
    userSince: { type: Date },
    personal: { type: String, trim: true, maxLength: 300 },
    realName: { type: String },
    birthday: { type: Date },
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

PostSchema.virtual("userSince_string").get(function () {
  return DateTime.fromJSDate(this.userSince).toLocaleString(DateTime.DATE_FULL);
});

PostSchema.virtual("birthday_string").get(function () {
  return DateTime.fromJSDate(this.birthday).toLocaleString(DateTime.DATE_FULL);
});

module.exports = mongoose.model("User", UserSchema);
