const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const requestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  recipient: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Request", requestSchema);
