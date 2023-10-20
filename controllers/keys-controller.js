const jwt = require("jsonwebtoken");
const handleToken = require("./handle-token");
const asyncHandler = require("express-async-handler");

exports.giphyAPI = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(
      req.token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          res.json({ message: "Credentials expired, please login again." });
        } else {
          res.json(process.env.GIPHY_API);
        }
      }
    );
  }),
];
