const User = require("../models/user");
const Chat = require("../models/chat");

const chatHandler = (io, socket) => {
  // Get all chat listener, awaits incoming request from client and responds with all chats for the current user
  socket.on("get all chats", async (username, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 });

    const chats = await Promise.all(
      user.chats.map(async (chat) => {
        return await Chat.findById(chat, { message: 0 })
          .populate("users")
          .populate("latestMsg")
          .populate({
            path: "messages",
            options: { limit: 20, sort: { timestamp: -1 } },
          })
          .exec();
      })
    );

    callback({ chats });
  });
};

module.exports = chatHandler;
