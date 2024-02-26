const cheerio = require("cheerio");
const https = require("https");

const getMetaData = async (url) => {
  const html = await getURL(url);
  const $ = cheerio.load(html);
  const $meta = $("meta[property]");
  console.log("page loaded", url);
  console.log($meta.attr());

  $meta.each((i, elem) => {
    console.log($(elem).attr());
  });
  //console.log($meta.attr("content"));

  //   for (const tag of Object.entries($meta)) {
  //     console.log(tag.attr("property"));
  //     console.log(tag.attr("content"));
  //   }
};

const getURL = (url) => {
  return new Promise((resolve, reject) => {
    try {
      https
        .get(url, (res) => {
          let content = "";

          res.on("data", (chunk) => {
            content += chunk;
          });

          res.on("end", () => {
            resolve(content);
          });
        })
        .on("error", (e) => {
          console.error(e);
        });
    } catch (e) {
      reject(console.log(e));
    }
  });
};

module.exports = getMetaData;
