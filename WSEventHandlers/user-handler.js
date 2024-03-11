const User = require("../models/user");

const userHandler = (socket, io) => {
  socket.on("user login", async (username, callback) => {
    console.log(username, "connected!");
    socket.join(username);
    console.log(socket.id, socket.rooms);

    const user = await User.findOne({ username: username })
      .populate({
        path: "friends",
        options: { sort: { username: 1 } },
      })
      .populate({
        path: "requestIn",
        options: { sort: { username: 1 } },
      })
      .populate({
        path: "requestOut",
        options: { sort: { username: 1 } },
      })
      .populate("comments")
      .populate("chats")
      .exec();

    if (user.online) {
      console.log("dupe login");
      socket.broadcast.to(username).emit("duplicate login");
    }

    user.online = true;

    await user.save();

    socket.broadcast.emit("friend login", username);

    callback({ user });
  });

  socket.on("user logout", async (username) => {
    const user = await User.findOne({ username: username }).exec();

    user.online = false;
    await user.save();

    socket.broadcast.emit("friend logout", username);
  });

  socket.on("edit profile", async (username, dataObj) => {
    const user = await User.findOne({ username: username }).exec();

    user.country = dataObj.country;
    user.personal = dataObj.personal;
    user.birthday = dataObj.birthday;
    user.avatar = dataObj.avatar;

    await user.save();
  });

  socket.on("disconnect", (reason) => {
    console.log("user disconnected");
    console.log(reason);
  });

  socket.on("all connections", () => {
    console.log(io.sockets.sockets);
  });
};

module.exports = userHandler;
