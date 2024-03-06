const express = require("express");
const router = express.Router();
const keysController = require("../controllers/keys-controller");
const getMetaData = require("../javascript/getMetaData");

// GET Giphy API key stored in .env
router.get("/giphyAPI", keysController.giphyAPI);

// Testing URL fetching
router.post("/fetchURL", async (req, res, next) => {
  const metaData = await getMetaData(req.body.url);
  res.json({ metaData });
});

module.exports = router;
