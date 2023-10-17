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
            profile: friend.username,
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

// DELETES a comment on the signed in user's profile by removing it from the user object comment array.  Then returns updated user
// to front end to have updates reflected in UI
exports.profile_comment_DELETE = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(
      req.token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          res.json({ message: "Credentials expired, please login again." });
        } else {
          const user = await User.findOne(
            { username: req.params.user },
            { password: 0 }
          )
            .populate("friends")
            .populate("requestIn")
            .populate("requestOut")
            .populate("comments")
            .exec();

          user.comments = user.comments.filter(
            (comment) => comment._id != req.params.id
          );

          await Comment.findByIdAndRemove(req.params.id).exec();
          await user.save();

          res.json({ message: "Comment removed", user });
        }
      }
    );
  }),
];
