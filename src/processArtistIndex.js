const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

module.exports = (dom, timestamp) =>
  DOMUtils.flattenDOM(dom)
    .filter(
      element =>
        element.type === "text" &&
        element.parentNode.name === "a" &&
        element.parentNode.attribs.class === "artist"
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
