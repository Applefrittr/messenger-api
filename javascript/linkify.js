const https = require("https");

const linkify = async (string) => {
  const re = /\bhttps?::?\/\/\S+/gi;
  const urls = [...string.matchAll(re)].flat(1);
  const url = string.match(re);
  let parsedText = string;

  if (urls.length === 0) return string;
  //if (!url) return string;
  else {
    console.log("url detected:", url);
    const urlTitles = urls.map(async (url) => {
      return await getURL(url);
    });

    //let title = await getURL(url[0]);

    console.log(urlTitles);
    //parsedText = parsedText.replace(/\bhttps?::?\/\/\S+/i, title);

    console.log("parsedText:", parsedText);

    //return { url, parsedText };

    return Promise.all(urlTitles).then((values) => {
      console.log(values);
      values.forEach((value) => {
        parsedText = parsedText.replace(/\bhttps?::?\/\/\S+/i, value);
      });
      //setParsedText(parsedText);
      console.log(parsedText);
      return { urls, parsedText };
    });
  }
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
            const re = new RegExp("<title>(.*?)</title>");
            let title_re = re.exec(content);
            if (title_re) {
              console.log("title:", title_re[1]);
              resolve(title_re[1]);
            } else resolve(url);
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

module.exports = linkify;
