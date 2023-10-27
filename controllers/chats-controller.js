const asyncHandler = require("express-async-handler");
const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const handleToken = require("./handle-token");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

// GET all chats associated with the passed url param user and return to the front end
exports.all_chats_GET = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(
      req.token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          res.json({ message: "Credentials expired, please login again." });
        } else {
          const user = await User.findOne(
            { username: req.params.user },
            { password: 0 }
          );

          const chats = await Promise.all(
            user.chats.map(async (chat) => {
              return await Chat.findById(chat)
                .populate("users")
                .populate("messages")
                .exec();
            })
          );

          res.json({ message: "GET all chats", chats });
        }
      }
    );
  }),
];

// POST a new chat.  Finds all users passed to the call (2 person or group chat), creates a new Chat object as well as the opening message.
// Then pushes Chat object to all associated Users and saves all changes to the DB
exports.new_chat_POST = [
  body("text").trim().escape(),
  handleToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(
      req.token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          res.json({ message: "Credentials expired, please login again." });
        } else {
          console.log("new chat started...");
          const user = await User.findOne(
            { username: req.params.user },
            { password: 0 }
          )
            .populate("friends")
            .populate("requestIn")
            .populate("requestOut")
            .populate("comments")
            .populate("chats")
            .exec();

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
            });

            for (const user of recipients) {
              user.chats.push(chat);
            }
          }

          const message = new Message({
            username: req.params.user,
            chat: chat,
            timestamp: new Date(),
            text: req.body.text,
          });

          chat.messages.push(message);

          for (const user of recipients) {
            await user.save();
          }
          await chat.save();
          await message.save();

          res.json({ message: "New Chat started" });
        }
      }
    );
  }),
];
