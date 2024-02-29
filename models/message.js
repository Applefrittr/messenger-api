const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    avatar: { type: String },
    chat: { type: String },
    timestamp: { type: Date },
    text: { type: String },
    gif: { type: String },
    groupChat: { type: Boolean },
    urlMetaData: {
      url: { type: String },
      title: { type: String },
      description: { type: String },
      image: { type: String },
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

MessageSchema.virtual("timestamp_string").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime.DATETIME_MED
  );
});

module.exports = mongoose.model("Message", MessageSchema);
