const cheerio = require("cheerio");
const axios = require("axios");

// Take a param URL, request the markup with axios and then scrape the meta tag data using cheerio.  Pass the resulting
// data object back to handler to be routed back to client for rendering
const getMetaData = async (url) => {
  const metaData = { url: null, title: null, description: null, image: null };

  // NEED AN ERROR HANDLER IF AXIOS GET REQUEST FAILS OR INVALID URL IS PASSED!
  const response = await axios.get(url);

  const $ = cheerio.load(response.data);

  // Select Open Graph meta tags and assign the contents to our metaData object
  const $metaDataOG = $(`meta[property^="og:"]`);

  $metaDataOG.each((i, elem) => {
    const metaTag = $(elem).attr();

    for (const key of Object.keys(metaData)) {
      if (metaTag.property.includes(key)) {
        metaData[key] = metaTag.content;
      }
    }
  });

  console.log(metaData);
  return metaData;
};

module.exports = getMetaData;
