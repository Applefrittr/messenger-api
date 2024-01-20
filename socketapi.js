// const io = require("socket.io")();
// const { Server } = require("socket.io");

// const socketapi = { io };

// io.on("connection", (socket) => {
//   console.log("User connected");
// });

const mount = (socketio) => {
  socketio.on("connection", (socket) => {
    console.log("User connected");
  });

  socketio.on("user", (username) => {
    console.log("Connected user: ", username);
  });
  return socketio;
};

module.exports = mount;
