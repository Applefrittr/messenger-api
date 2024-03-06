const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    author: { type: String },
    avatar: { type: String },
    text: { type: String },
    gif: { type: String },
    profile: { type: String },
    timestamp: { type: Date },
    urlMetaData: { type: Map, of: String },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

CommentSchema.virtual("timestamp_string").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime.DATETIME_MED
  );
});

module.exports = mongoose.model("Comment", CommentSchema);
