const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const getMetaData = async (url) => {
  const response = await axios.get(url);

  fs.writeFile("./index.html", response.data, (err) => {
    if (err) throw err;
    console.log("file written!");
  });
  const $ = cheerio.load(response.data);

  const $metaData = $("meta[property]");

  $metaData.each((i, elem) => {
    console.log($(elem).attr());
  });
};

module.exports = getMetaData;
