const asyncHandler = require("express-async-handler");
const { body } = require("express-validator");
const handleToken = require("./handle-token");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

// GET all chats associated with the passed url param user and return to the front end
exports.all_chats_GET = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne(
      { username: req.params.user },
      { password: 0 }
    );

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
    res.json({ message: "GET all chats", chats });
  }),
];

// GET a specific chat by the ID passed into the uri params from the front end, excluding all messages (unique route and controller to paginate message data)
exports.chat_GET = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    const chat = await Chat.findById(req.params.id, { messages: 0 })
      .populate("users")
      .exec();

    res.json({ message: "GET chat", chat });
  }),
];

// GET new page of chat messages, paginating the message data
exports.chat_page_GET = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    const chat = await Chat.findById(req.params.id)
      .populate("users")
      .populate("messages")
      .exec();

    const messages = [...chat.messages]
      .reverse()
      .slice((req.params.page - 1) * 40, req.params.page * 40);

    let hasMore;
    req.params.page * 40 > chat.msgNum ? (hasMore = false) : (hasMore = true);

    res.json({ message: "GET chat", messages, hasMore });
  }),
];

// POST new message to an existiing chat, return updated chat back to the client
exports.chat_POST = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    const chat = await Chat.findById(req.params.id)
      .populate("users")
      .populate("messages")
      .exec();

    const message = new Message({
      username: req.params.user,
      chat: chat._id,
      timestamp: new Date(),
      text: req.body.text,
      gif: req.body.gif,
    });

    chat.messages.push(message);
    chat.msgNum++;
    chat.latestMsg = message;

    await chat.save();
    await message.save();

    res.json({ message });
  }),
];

// POST a new chat.  Finds all users passed to the call (2 person or group chat), creates a new Chat object as well as the opening message.
// Then pushes Chat object to all associated Users and saves all changes to the DB
exports.new_chat_POST = [
  body("text").trim().escape(),
  handleToken,
  asyncHandler(async (req, res, next) => {
    console.log("new chat started...");
    const user = await User.findOne(
      { username: req.params.user },
      { password: 0 }
    ).exec();

    // return an array of Users to add to the chat
    const recipients = await Promise.all(
      req.body.users.map(async (user) => {
        return await User.findOne({ username: user }).exec();
      })
    );

    recipients.push(user);

    const usernames = recipients.map((user) => {
      return user.username;
    });

    let chat;

    if (req.body.chatID) {
      console.log("Exisiting chat");
      chat = await Chat.findById(req.body.chatID).exec();
    } else {
      console.log("New chat");
      chat = new Chat({
        users: recipients,
        usernames: usernames,
        messages: [],
        msgNum: 0,
      });

      for (const user of recipients) {
        user.chats.push(chat);
      }
    }

    const message = new Message({
      username: req.params.user,
      chat: chat._id,
      timestamp: new Date(),
      text: req.body.text,
    });

    chat.messages.push(message);
    chat.msgNum++;
    chat.latestMsg = message;

    for (const user of recipients) {
      await user.save();
    }
    await chat.save();
    await message.save();

    res.json({ message: "New Chat started", id: chat._id });
  }),
];
