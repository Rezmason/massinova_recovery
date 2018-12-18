const mineUtils = require("./mineUtils.js");
const DOMUtils = require("./DOMUtils.js");

const isArtistATag = DOMUtils.quickMatch("a", "artists");
const isDataFontTag = DOMUtils.quickMatch("font", "data");

module.exports = (dom, timestamp, songID) => {
  const result = {};

  const allTags = DOMUtils.flattenDOM(dom);

  const locationTag = allTags.find(
    element => element.name === "font" && element.attribs.class === "location"
  );
  if (locationTag != null) {
    result.songName = mineUtils.decodeEntities(
      locationTag.children[0].children[0].data
    );
    result.songID = songID;

    const dataFontTags = new Set(
      allTags
        .filter(isArtistATag)
        .map(element => DOMUtils.climbDOM(element, isDataFontTag))
    );

    const credits = {};
    let artist = null;
    let credit = null;

    const creditElements = []
      .concat(
        ...Array.from(dataFontTags.values()).map(element => element.children)
      )
      .map(element => {
        if (element.name === "a") {
          let url = mineUtils.decodeEntities(element.attribs.href);
          if (url.indexOf("http") !== 0 && url.indexOf("/web") !== 0) {
            url = `${timestamp}/${url}`;
          }
          const urlData = mineUtils.extractURLData(url);
          return { type: "artist", text: urlData.artist };
        } else if (element.type === "text") {
          return {
            type: "text",
            text: mineUtils.decodeEntities(element.data).trim()
          };
        }
      });

    creditElements.forEach(({ type, text }) => {
      switch (type) {
        case "artist":
          if (artist != null) {
            throw new Error(
              `Artist collision, ${timestamp}, ${artist}, ${text}`
            );
          }
          artist = text;
          break;
        default:
          if (text.includes("by") || text.includes("vs")) {
            credit = text.replace(" by", "").replace(", ", "");
          }
          break;
      }

      if (credit != null && artist != null) {
        credits[`credit_${credit}`] = artist;
        credit = null;
        artist = null;
      }
    });

    if (credits.credit_by != null) {
      result.artistName = credits.credit_by;
    } else if (credits.credit_original != null) {
      result.artistName = credits.credit_original;
    }

    Object.assign(result, credits);
  }

  if (Object.keys(result).length === 0) {
    result.empty = true;
  }

  result.timestamp = timestamp;
  return result;
};
