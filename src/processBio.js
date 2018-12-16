const mineUtils = require("./mineUtils.js");
const DOMUtils = require("./DOMUtils.js");

const isBioFontTag = DOMUtils.quickMatch("font", "bio");

module.exports = (dom, timestamp, artistName, bioPage) => {
  const allElements = DOMUtils.flattenDOM(dom);

  const artistWebsiteElement = allElements.find(
    element =>
      element.type === "text" && element.data.toLowerCase() === "web site"
  );

  const artistWebsite =
    artistWebsiteElement == null
      ? null
      : artistWebsiteElement.parentNode.attribs.href.split("http://").pop();

  const bioElements = allElements.filter(isBioFontTag).map(element =>
    element.children
      .filter(child => child.type === "text")
      .map(child => mineUtils.decodeEntities(child.data).trim())
      .join("¶")
  );

  const bio = bioElements
    .join("¶")
    .split("--")
    .map(text => text.trim());

  const bioText = bio[0].replace(/\.¶/g, ".\n\n").replace(/¶/g, " ");

  const bioData = bio
    .slice(1)
    .map(text => text.split("¶").map(line => line.split(": ")))
    .pop();

  const result = {
    timestamp,
    [`bioPage${bioPage}`]: bioText,
    artistName,
    artistWebsite
  };

  if (bioData != null) {
    result.artistInfo = {};
    bioData.forEach(line => {
      if (line.length === 1) {
        if (result.bioWriter != null) {
          throw new Error("Bio writer collision.");
        }
        result.bioWriter = line[0];
      } else {
        result.artistInfo[line[0].toLowerCase().trim()] = line[1];
      }
    });
  }

  return result;
};
