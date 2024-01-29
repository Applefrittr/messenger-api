const User = require("../models/user");
const Comment = require("../models/comment");

const commentHandler = (io, socket) => {
  socket.on("post comment", async (username, recipient, content, callback) => {
    const user = await User.findOne({ username: username }).exec();
    const friend = await User.findOne({
      username: recipient,
    }).exec();

    const comment = new Comment({
      author: user.username,
      avatar: user.avatar,
      text: content.text,
      gif: content.gif,
      timestamp: new Date(),
      profile: friend.username,
    });

    friend.comments.unshift(comment);
    await friend.save();
    await comment.save();

    socket.to(friend.username).emit("new comment", comment);

    callback({ comment });
  });
};

module.exports = commentHandler;
