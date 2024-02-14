const User = require("../models/user");

const connectionHandler = (socket) => {
  socket.on("hello", (username) => {
    console.log(username, "connected!");
    socket.join(username);
    console.log(socket.id, socket.rooms);
    socket.broadcast.emit("friend login", username);
  });

  socket.on("user logout", async (username) => {
    const user = await User.findOne({ username: username }).exec();

    user.online = false;
    await user.save();

    socket.broadcast.emit("friend logout", username);
  });

  socket.on("disconnect", (reason) => {
    console.log("user disconnected");
    console.log(reason);
  });
};

module.exports = connectionHandler;
