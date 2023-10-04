const asyncHandler = require("express-async-handler");
const Request = require("../models/request.js");
const User = require("../models/user.js");

// GET all friend request controller
exports.request_GET = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.user }).exec();

  const incoming = user.requestIn;
  const outgoing = user.requestOut;

  res.json({ incoming, outgoing });
});

// POST new friend request controller
exports.request_POST = asyncHandler(async (req, res, next) => {
  console.log("Request started...");

  const user = await User.findOne({ username: req.params.user }).exec();
  const recipient = await User.findOne({
    username: req.params.recipient,
  }).exec();

  console.log(user, recipient);

  user.requestOut.push(recipient);
  recipient.requestIn.push(user);

  await user.save();
  await recipient.save();

  res.json({ message: "Request Sent" });
});

exports.accept_request_POST = asyncHandler(async (req, res, next) => {
  const user1 = await User.findOne({ username: req.params.user })
    .populate("requestIn")
    .exec();
  const user2 = await User.findOne({
    username: req.params.recipient,
  })
    .populate("requestOut")
    .exec();

  user1.requestIn = user1.requestIn.filter(
    (friend) => friend.username !== user2.username
  );
  user2.requestOut = user2.requestOut.filter(
    (friend) => friend.username !== user1.username
  );

  user1.friends.push(user2);
  user2.friends.push(user1);

  await user1.save();
  await user2.save();

  res.json({ message: "Accepted" });
});

exports.decline_request_POST = asyncHandler(async (req, res, next) => {
  const user1 = await User.findOne({ username: req.params.user })
    .populate("requestIn")
    .populate("requestOut")
    .exec();
  const user2 = await User.findOne({
    username: req.params.recipient,
  })
    .populate("requestIn")
    .populate("requestOut")
    .exec();

  user1.requestIn = user1.requestIn.filter(
    (friend) => friend.username !== user2.username
  );
  user1.requestOut = user1.requestOut.filter(
    (friend) => friend.username !== user2.username
  );
  user2.requestOut = user2.requestOut.filter(
    (friend) => friend.username !== user1.username
  );
  user2.requestIn = user2.requestIn.filter(
    (friend) => friend.username !== user1.username
  );

  await user1.save();
  await user2.save();

  res.json({ message: "Declined" });
});
