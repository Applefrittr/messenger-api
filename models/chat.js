const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  usernames: [{ type: String }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  msgNum: { type: Number },
  latestMsg: { type: Schema.Types.ObjectId, ref: "Message" },
});

module.exports = mongoose.model("Chat", chatSchema);
