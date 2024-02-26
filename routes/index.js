const express = require("express");
const router = express.Router();
const keysController = require("../controllers/keys-controller");
const https = require("https");
const linkify = require("../javascript/linkify");
const getMetaData = require("../javascript/getMetaData");

// GET Giphy API key stored in .env
router.get("/giphyAPI", keysController.giphyAPI);

// Testing URL fetching
router.post("/fetchURL", async (req, res, next) => {
  //   const getData = (url, callback) => {
  //     try {
  //       https
  //         .get(url, (res) => {
  //           let content = "";

  //           res.on("data", (chunk) => {
  //             content += chunk;
  //           });

  //           res.on("end", () => {
  //             const re = new RegExp("<title>(.*?)</title>");
  //             let title_re = re.exec(content);
  //             //console.log(content);
  //             callback(title_re[1]);
  //           });
  //         })
  //         .on("error", (e) => {
  //           console.error(e);
  //         });
  //     } catch (e) {
  //       //console.log(e);
  //       next(e);
  //     }
  //   };
  //console.log("body:", req.body);
  //const parsedText = await linkify(req.body.url);
  getMetaData(req.body.url);
  res.json({ message: "paged loaded" });
});

module.exports = router;
