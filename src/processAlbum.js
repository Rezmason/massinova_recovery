const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

module.exports = (dom, timestamp, albumID) => {
  const allElements = DOMUtils.flattenDOM(dom);

  const albumName = mineUtils.decodeEntities(
    allElements.find(
      element =>
        element.type === "text" &&
        DOMUtils.climbDOM(
          element,
          DOMUtils.quickMatch("font", "album-title")
        ) != null
    ).data
  );

  const albumCDNowATag = allElements.find(
    element => element.name === "a" && element.attribs.href.includes("cdnow")
  );
  const albumCDNowURL = albumCDNowATag
    ? albumCDNowATag.attribs.href.split("http://").pop()
    : null;

  const recordLabel = allElements.find(
    element =>
      element.type === "text" &&
      DOMUtils.climbDOM(element, DOMUtils.quickMatch("font", "album")) != null
  );

  const recordLabelName =
    recordLabel != null ? mineUtils.decodeEntities(recordLabel.data) : null;

  const pieces = allElements.filter(
    element =>
      element.type === "text" &&
      DOMUtils.climbDOM(element, DOMUtils.quickMatch("div", "marker")) != null
  );

  const clumps = mineUtils.clump(
    pieces,
    piece => DOMUtils.climbDOM(piece, DOMUtils.quickMatch("a", "track")) != null
  );

  const tracks = clumps.map(pieces => {
    const result = {
      timestamp,
      albumName,
      albumID
    };
    pieces.forEach(piece => {
      const aTag = DOMUtils.climbDOM(piece, DOMUtils.quickMatch("a"));
      if (aTag) {
        let url = mineUtils.decodeEntities(aTag.attribs.href);
        if (url.indexOf("http") !== 0 && url.indexOf("/web") !== 0) {
          url = `${timestamp}/${url}`;
        }
        result.songID = parseFloat(mineUtils.extractURLData(url).track);
        result.songName = mineUtils.decodeEntities(piece.data);
      } else {
        const fontTag = DOMUtils.climbDOM(piece, DOMUtils.quickMatch("font"));
        if (fontTag != null) {
          if (fontTag.attribs.class === "popularity") {
            result.popularity = piece.data.length;
          } else if (fontTag.attribs.class === "requests") {
            result.numRequests = parseFloat(piece.data);
          }
        }
      }
    });
    if (recordLabelName != null) result.recordLabelName = recordLabelName;
    if (albumCDNowURL != null) result.albumCDNowURL = albumCDNowURL;
    return result;
  });

  return tracks;
};
