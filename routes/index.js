const express = require("express");
const router = express.Router();
const keysController = require("../controllers/keys-controller");

// GET Giphy API key stored in .env
router.get("/giphyAPI", keysController.giphyAPI);

module.exports = router;
