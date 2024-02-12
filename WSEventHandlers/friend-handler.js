const User = require("../models/user");

const friendHandler = (socket) => {
  // Get ALL users.  Passed to client for the search component.
  socket.on("get users", async (callback) => {
    const users = await User.find(
      {},
      {
        password: 0,
        personal: 0,
        birthday: 0,
        chats: 0,
        friends: 0,
        country: 0,
        requestIn: 0,
        requestOut: 0,
        comments: 0,
      }
    ).exec();

    callback({ users });
  });

  // Get friends listeners returns all users in the friend's list of the current user
  socket.on("get friends", async (username, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 })
      .populate("friends")
      .exec();

    callback({ friends: user.friends });
  });

  // Returns a specific profile back to client based on the passed username
  socket.on("get profile", async (username, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 })
      .populate("friends")
      .populate("comments")
      .exec();

    callback({ user });
  });

  // Returns all pending incoming and outgoing friends requests of the current user
  socket.on("get requests", async (username, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 })
      .populate("requestIn")
      .populate("requestOut")
      .exec();

    callback({ incoming: user.requestIn, outgoing: user.requestOut });
  });

  // New request updates the current user and recipient models in the DB, then passes the request arrays back to the client (both user and recipient)
  socket.on("new request", async (username, recipientUser, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 })
      .populate("requestIn")
      .populate("requestOut")
      .exec();

    const recipient = await User.findOne({
      username: recipientUser,
    })
      .populate("requestIn")
      .exec();

    user.requestOut.push(recipient);
    recipient.requestIn.push(user);

    await user.save();
    await recipient.save();

    socket.to(recipient.username).emit("incoming request", recipient.requestIn);
    socket
      .to(recipient.username)
      .emit(
        "notification",
        { msg: `Friend request recieved from ${username}`, type: "request" },
        null
      );

    callback({ requests: user.requestOut });
  });

  // Remove request updates both user models int he DB, then passes back updated lists back to client (user and recipient)
  socket.on("remove request", async (user1, user2, callback) => {
    const user = await User.findOne({ username: user1 })
      .populate("requestIn")
      .populate("requestOut")
      .exec();

    const recipient = await User.findOne({
      username: user2,
    })
      .populate("requestIn")
      .populate("requestOut")
      .exec();

    user.requestIn = user.requestIn.filter(
      (friend) => friend.username !== recipient.username
    );
    user.requestOut = user.requestOut.filter(
      (friend) => friend.username !== recipient.username
    );
    recipient.requestOut = recipient.requestOut.filter(
      (friend) => friend.username !== user.username
    );
    recipient.requestIn = recipient.requestIn.filter(
      (friend) => friend.username !== user.username
    );

    await user.save();
    await recipient.save();

    socket
      .to(recipient.username)
      .emit("remove request", recipient.requestIn, recipient.requestOut);

    callback({ incoming: user.requestIn, outgoing: user.requestOut });
  });

  // Updates both user models in DB then passes updates back to clients for UI re-rendering
  socket.on("accept request", async (user1, user2, callback) => {
    const user = await User.findOne({ username: user1 })
      .populate("requestIn")
      .populate("requestOut")
      .populate("friends")
      .exec();

    const recipient = await User.findOne({
      username: user2,
    })
      .populate("requestOut")
      .populate("friends")
      .exec();

    user.requestIn = user.requestIn.filter(
      (friend) => friend.username !== recipient.username
    );
    recipient.requestOut = recipient.requestOut.filter(
      (friend) => friend.username !== user.username
    );

    user.friends.push(recipient);
    recipient.friends.push(user);

    await user.save();
    await recipient.save();

    socket
      .to(recipient.username)
      .emit("accept request", recipient.requestOut, recipient.friends);

    callback({ incoming: user.requestIn, friends: user.friends });
  });

  // Remove friend removes user1 from user2's friends list and vice versa.  DB updates are saved then both user1 and user2 updated lists are
  // passed back to the client for UI re-renders
  socket.on("remove friend", async (user1, user2, callback) => {
    const user = await User.findOne({ username: user1 })
      .populate("friends")
      .exec();

    const target = await User.findOne({ username: user2 })
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

    socket.to(target.username).emit("remove friend", target.friends);

    callback({ friends: user.friends });
  });
};

module.exports = friendHandler;
