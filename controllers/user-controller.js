const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const handleToken = require("./handle-token");

// Create (POST) a new user with a hashed password using bcrypt
exports.create = [
  // Sanitize and Validate user inputs
  body("username", "Username must be at least 4 characters long")
    .trim()
    .isLength({ min: 4 })
    .escape(),
  body("password", "Password must be at least 6 characters long")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirm-password", "Passwords must match")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // if there are validation errors, pass them to front end, else create and save new user to DB
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      const user = new User({
        username: req.body.username,
      });

      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          console.log(err);
          return;
        } else {
          user.password = hashedPassword;
          await user.save();
          res.json({ message: "success!" });
        }
      });
    }
  }),
];

// Log the user in.  Find User in database, compare passwords and then create a jwt to be sent back tot he front end
exports.user_POST = [
  // Sanitize and Validate user inputs before login logic
  body("username", "Username required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password required").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    } else {
      const user = await User.findOne({ username: req.body.username }) // Query the user and call lean() to convert to regular JS object to prep for JWT serialization
        .lean()
        .exec();
      if (!user) {
        res.json({ errors: [{ msg: "User does not exist" }] });
        return;
      }
      if (await bcrypt.compare(req.body.password, user.password)) {
        // Create web token to be passed back to front end w/ a 1 day expiration
        console.log("creating jwt...");
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: 60 * 60 * 24,
        });
        res.json({ message: "User logged in", accessToken });
      } else {
        res.json({ errors: [{ msg: "Incorrect Password" }] });
      }
    }
  }),
];

// recieves a JWT from the front end, verifies, decodes, and then passes payload back to the front end (the logged in user info)
exports.user_GET = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        res.json({ message: "Credentials expired, please login again." });
      } else {
        res.json({ payload });
      }
    });
  }),
];
