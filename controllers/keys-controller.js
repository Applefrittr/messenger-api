const { handleToken } = require("./handle-token");
const asyncHandler = require("express-async-handler");

exports.giphyAPI = [
  handleToken,
  asyncHandler(async (req, res, next) => {
    res.json(process.env.GIPHY_API);
  }),
];
