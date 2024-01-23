const connectionHandler = (io, socket) => {
  socket.on("hello", (username) => {
    console.log(username, "conneced!");
    socket.join(username);
    console.log(socket.id, socket.rooms);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
};

module.exports = connectionHandler;
