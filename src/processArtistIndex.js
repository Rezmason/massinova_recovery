const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

module.exports = (dom, timestamp) => {
  const isArtistTag = DOMUtils.quickMatch("a", "artist");
  return DOMUtils.flattenDOM(dom)
    .filter(
      element => element.type === "text" && isArtistTag(element.parentNode)
    )
    .map(element => {
      const aTag = element.parentNode;
      let url = mineUtils.decodeEntities(aTag.attribs.href);
      if (url.indexOf("http") !== 0 && url.indexOf("/web") !== 0) {
        url = `${timestamp}/${url}`;
      }
      return {
        artistName: mineUtils.extractURLData(url).artist,
        timestamp
      };
    });
};
