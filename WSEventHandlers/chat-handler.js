const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

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

  // New Message listener, fires once a new message is emitted by a client and then responds with the new message object
  socket.on("send msg", async (user, chatID, msgObj, callback) => {
    console.log(msgObj.text);
    const chat = await Chat.findById(chatID)
      .populate("users")
      .populate("messages")
      .exec();

    const message = new Message({
      username: user,
      chat: chat._id,
      timestamp: new Date(),
      text: msgObj.text,
      gif: msgObj.gif,
    });

    chat.messages.push(message);
    chat.msgNum++;
    chat.latestMsg = message;

    await chat.save();
    await message.save();

    // filter out recipients from chat.username array then emit the new message to each user
    const recipients = chat.usernames.filter((username) => username !== user);

    console.log(recipients);
    socket.to(recipients).emit("new msg", message);

    callback({ message });
  });
};

module.exports = chatHandler;
