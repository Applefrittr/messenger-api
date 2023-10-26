const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const handleToken = require("./handle-token");

// Return a selected friend to the front end to display friend profile
exports.profile_GET = asyncHandler(async (req, res, next) => {
  const friend = await User.findOne(
    { username: req.params.friend },
    { password: 0 }
  ).exec();

  res.json({ friend });
});

// Remove a friend from the friends list.  Filters out targeted friend from curr user friends list as well as filters out the user from the target's friends lists
exports.remove_POST = asyncHandler(async (req, res, next) => {
  const user = await User.findOne(
    { username: req.params.user },
    { password: 0 }
  )
    .populate("friends")
    .populate("requestIn")
    .populate("requestOut")
    .populate("comments")
    .populate("chats")
    .exec();

  const target = await User.findOne({ username: req.params.friend })
    .populate("friends")
    .exec();

  user.friends = user.friends.filter(
    (friend) => friend.username !== target.username
  );
  target.friends = target.friends.filter(
    (friend) => friend.username !== user.username
  );

  user.save();
  target.save();

  res.json({ message: "Friend removed", user });
});
