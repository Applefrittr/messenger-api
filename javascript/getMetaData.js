const cheerio = require("cheerio");
const axios = require("axios");

// Take a param URL, request the markup with axios and then scrape the meta tag data using cheerio.  Pass the resulting
// data object back to handler to be routed back to client for rendering
const getMetaData = async (url) => {
  try {
    const metaData = {
      "og:site_name": null,
      "og:title": null,
      "og:description": null,
      "og:image": null,
      "og:url": null,
    };

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    // Select Open Graph meta tags and assign the contents to our metaData object
    const $metaDataOG = $(`meta[property^="og:"]`);

    $metaDataOG.each((i, elem) => {
      const metaTag = $(elem).attr();
      console.log(metaTag);

      for (const key of Object.keys(metaData)) {
        if (metaTag.property === key) {
          metaData[key] = metaTag.content;
        }
      }
    });

    if (metaData["og:title"] === null) {
      const $titleHTML = $("title");
      metaData["og:title"] = $titleHTML.text();
    }

    // Set url value to passed url param
    metaData["og:url"] = url;
    console.log(metaData);

    return metaData;
  } catch (err) {
    console.log("Unable to retrieve url content");
    return null;
  }
};

module.exports = getMetaData;
