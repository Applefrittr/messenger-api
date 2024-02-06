const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

const chatHandler = (io, socket) => {
  // Get all chat listener, awaits incoming request from client and responds with all chats for the current user
  socket.on("get all chats", async (username, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 });

    const chats = await Promise.all(
      user.chats.map(async (chat) => {
        return await Chat.findById(chat)
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

  // Chat listener, returns the Chat instance back to client via chat ID
  socket.on("get chat", async (chatID, callback) => {
    const chat = await Chat.findById(chatID, { messages: 0 })
      .populate("users")
      .exec();

    callback({ chat });
  });

  // Get Chat page listener, paginates the message data in the Chat object and returns a chunk back tot he client
  socket.on("get chat page", async (chatID, pageNum, callback) => {
    const chat = await Chat.findById(chatID)
      .populate("users")
      .populate("messages")
      .exec();

    const messages = [...chat.messages]
      .reverse()
      .slice((pageNum - 1) * 40, pageNum * 40);

    let hasMore;
    pageNum * 40 > chat.msgNum ? (hasMore = false) : (hasMore = true);

    callback({ messages, hasMore });
  });

  // New Message listener, fires once a new message is emitted by a client and then responds with the new message object.
  // Also emits a notification msg as well as the updated chat obj to be rendered in the client
  socket.on("send msg", async (user, chatID, msgObj, callback) => {
    console.log(msgObj.text);
    const chat = await Chat.findById(chatID)
      .populate({ path: "users", populate: { path: "chats" } })
      .populate({
        path: "messages",
        options: { limit: 20, sort: { timestamp: -1 } },
      })
      .populate("latestMsg")
      .exec();

    // const users = await Promise.all(
    //   chat.users.map(async (user) => {
    //     return await User.findById(user._id).populate("chats").exec();
    //   })
    // );

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

    chat.users.forEach(async (user) => {
      user.chats = user.chats.filter((chatObj) => chatObj.id !== chat.id);
      user.chats.unshift(chat);
      await user.save();
    });

    await chat.save();
    await message.save();

    // filter out recipients from chat.username array then emit the new message to each user
    const recipients = chat.usernames.filter((username) => username !== user);

    console.log(recipients);
    socket.to(recipients).emit("new msg", message, chatID);
    socket
      .to(recipients)
      .emit(
        "notification",
        { msg: `New message from ${user}`, type: "message" },
        chatID
      );
    //socket.to(recipients).emit("update chat list", chat);

    callback({ message });
  });

  socket.on("send new message", async (username, msgObj, callback) => {
    const user = await User.findOne(
      { username: username },
      { password: 0 }
    ).exec();

    // return an array of Users to add to the chat
    const users = await Promise.all(
      msgObj.users.map(async (user) => {
        return await User.findOne({ username: user }).exec();
      })
    );

    users.push(user);

    const usernames = users.map((user) => {
      return user.username;
    });

    const recipients = usernames.filter((user) => user !== username);

    let chat;

    if (msgObj.chatID) {
      console.log("Exisiting chat");
      chat = await Chat.findById(msgObj.chatID).exec();
    } else {
      console.log("New chat");
      chat = new Chat({
        users: users,
        usernames: usernames,
        messages: [],
        msgNum: 0,
      });
    }

    const message = new Message({
      username: username,
      chat: chat._id,
      timestamp: new Date(),
      text: msgObj.text,
      gif: msgObj.gif,
    });

    chat.messages.push(message);
    chat.msgNum++;
    chat.latestMsg = message;

    //socket.to(usernames).emit("update chat list", chat);

    for (const user of users) {
      user.chats.push(chat);
    }

    for (const user of users) {
      await user.save();
    }
    await chat.save();
    await message.save();

    socket
      .to(recipients)
      .emit(
        "notification",
        { msg: `New message from ${username}`, type: "message" },
        chat._id
      );
    callback({ id: chat._id });
  });
};

module.exports = chatHandler;
