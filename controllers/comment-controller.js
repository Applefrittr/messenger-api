const asyncHandler = require("express-async-handler");
const Comment = require("../models/comment.js");
const jwt = require("jsonwebtoken");
const handleToken = require("./handle-token");
const User = require("../models/user");

// Create a new post and add the comment object to the friend's profile.  Protected by jwt
exports.comment_POST = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(
      req.token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          res.json({ message: "Credentials expired, please login again." });
        } else {
          const user = await User.findOne({ username: req.params.user }).exec();
          const friend = await User.findOne({
            username: req.params.friend,
          }).exec();

          const comment = new Comment({
            author: user.username,
            avatar: user.avatar,
            text: req.body.text,
            timestamp: new Date(),
          });

          friend.comments.push(comment);
          await friend.save();
          await comment.save();

          res.json({ message: "Comment posted", comment });
        }
      }
    );
  }),
];
