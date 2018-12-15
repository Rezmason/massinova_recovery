const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

module.exports = (dom, timestamp) => {
  const isCoverTag = DOMUtils.quickMatch("a", "cover");
  return DOMUtils.flattenDOM(dom)
    .filter(
      element =>
        element.type === "tag" &&
        element.name === "img" &&
        isCoverTag(element.parentNode)
    )
    .map(element => {
      const aTag = element.parentNode;
      let url = mineUtils.decodeEntities(aTag.attribs.href);
      if (url.indexOf("http") !== 0 && url.indexOf("/web") !== 0) {
        url = `${timestamp}/${url}`;
      }
      return {
        albumName: aTag.attribs.title,
        albumID: parseFloat(mineUtils.extractURLData(url).album),
        timestamp
      };
    });
};
