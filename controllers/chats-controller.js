const asyncHandler = require("express-async-handler");
const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const handleToken = require("./handle-token");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

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
          // return an array of Users to add to the chat
          const users = Promise.all(
            req.body.users.map(async (user) => {
              return await User.findOne({ username: user.username }).exec();
            })
          );

          const chat = new Chat({
            users: users,
            messages: [],
          });

          const message = new Message({
            username: req.params.user,
            chat: chat,
            timestamp: new Date(),
            text: req.body.text,
          });

          chat.messages.push(message);

          for (const user of users) {
            user.chats.push(chat);
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
