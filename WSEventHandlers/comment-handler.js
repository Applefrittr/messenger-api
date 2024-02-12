const User = require("../models/user");
const Comment = require("../models/comment");

const commentHandler = (socket) => {
  // New comment listener.  When a new comment is recieved from the front end, updates DB, emits the new comment to the recipient user, and then response to the
  // current user w/ the comment to update UI
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
    socket
      .to(friend.username)
      .emit(
        "notification",
        { msg: `${username} commented on your profile`, type: "comment" },
        null
      );

    callback({ comment });
  });

  // Remove comment listener.  When triggered, DB is updated, then and updated comment list is emited to profile user as well as the
  // current user to update comment list in UI
  socket.on("remove comment", async (username, commentID, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 })
      .populate("comments")
      .exec();

    user.comments = user.comments.filter((comment) => comment._id != commentID);

    await Comment.findByIdAndRemove(commentID).exec();
    await user.save();

    socket.to(user.username).emit("update comments", user.comments);

    callback({ comments: user.comments });
  });
};

module.exports = commentHandler;
