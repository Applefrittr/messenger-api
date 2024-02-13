const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

const chatHandler = (socket) => {
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

  // update messages for user, setting unread counter to 0
  socket.on("read messages", async (chatID, username) => {
    const chat = await Chat.findById(chatID, { messages: 0 }).exec();

    if (chat.newMsgCounter) {
      const unreadObj = chat.newMsgCounter.find((obj) => obj.user === username);
      if (unreadObj && unreadObj.unread > 0) {
        unreadObj.unread = 0;
        await chat.save();
      }
    }
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

    // filter out recipients from chat.username array
    const recipients = chat.usernames.filter((username) => username !== user);

    const message = new Message({
      username: user,
      chat: chat._id,
      timestamp: new Date(),
      text: msgObj.text,
      gif: msgObj.gif,
    });

    recipients.forEach((username) => {
      const counterObj = chat.newMsgCounter.find(
        (obj) => obj.user === username
      );

      if (counterObj) {
        counterObj.unread = counterObj.unread + 1;
      } else {
        chat.newMsgCounter.push({ user: username, unread: 1 });
      }
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

    socket.to(recipients).emit("new msg", message, chatID);
    socket
      .to(recipients)
      .emit(
        "notification",
        { msg: `New message from ${user}`, type: "message" },
        chatID
      );

    socket.to(recipients).emit("update chat list");

    callback({ message });
  });

  // Listener is fired when client sends message using the New Message functionality.  Can send a message to an exising chat OR start a new
  // chat entirely.  Emits notifications to all recipients and updates chat lists respectively
  socket.on("send new message", async (username, msgObj, callback) => {
    const user = await User.findOne({ username: username }, { password: 0 })
      .populate("chats")
      .exec();

    // return an array of Users to add to the chat
    const users = await Promise.all(
      msgObj.users.map(async (user) => {
        return await User.findOne({ username: user }).populate("chats").exec();
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

      users.forEach((user) => {
        user.chats = user.chats.filter((chatObj) => chatObj.id !== chat.id);
        user.chats.unshift(chat);
      });
    } else {
      console.log("New chat");
      chat = new Chat({
        users: users,
        usernames: usernames,
        messages: [],
        msgNum: 0,
      });

      for (const user of users) {
        user.chats.unshift(chat);
      }
    }

    const message = new Message({
      username: username,
      chat: chat._id,
      timestamp: new Date(),
      text: msgObj.text,
      gif: msgObj.gif,
    });

    recipients.forEach((username) => {
      const counterObj = chat.newMsgCounter.find(
        (obj) => obj.user === username
      );

      if (counterObj) {
        counterObj.unread = counterObj.unread + 1;
      } else {
        chat.newMsgCounter.push({ user: username, unread: 1 });
      }
    });

    chat.messages.push(message);
    chat.msgNum++;
    chat.latestMsg = message;

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

    socket.to(usernames).emit("update chat list");

    callback({ id: chat._id });
  });

  socket.on("user typing", async (username, chatID) => {
    const chat = await Chat.findById(chatID).exec();

    const recipients = chat.usernames.filter((user) => user !== username);

    socket.to(recipients).emit("user typing", username);
  });
};

module.exports = chatHandler;
