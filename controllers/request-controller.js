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
  const user = await User.findOne({ username: req.params.user }).exec();
  const recipient = await User.findOne({
    username: req.params.recipient,
  }).exec();

  user.requestOut = user.requestOut.filter(
    (friend) => friend.username != recipient.username
  );
  recipient.requestIn = recipient.requestIn.filter(
    (friend) => friend.username != user.username
  );

  user.friends.push(recipient);
  recipient.friends.push(user);

  await user.save();
  await recipient.save();

  res.json({ message: "Accepted" });
});

exports.decline_request_POST = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.user }).exec();
  const recipient = await User.findOne({
    username: req.params.recipient,
  }).exec();

  user.requestOut = user.requestOut.filter(
    (friend) => friend.username != recipient.username
  );
  recipient.requestIn = recipient.requestIn.filter(
    (friend) => friend.username != user.username
  );

  res.json({ message: "Declined" });
});
