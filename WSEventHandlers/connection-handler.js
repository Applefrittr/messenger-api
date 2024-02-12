const connectionHandler = (socket) => {
  socket.on("hello", (username) => {
    console.log(username, "connected!");
    socket.join(username);
    console.log(socket.id, socket.rooms);
  });

  socket.on("disconnect", (reason, description) => {
    console.log("user disconnected");
    console.log(reason);
    console.log(description);
  });
};

module.exports = connectionHandler;
