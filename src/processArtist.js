const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

module.exports = (dom, timestamp) => {
  const isTrackDiv = DOMUtils.quickMatch("div", "marker");
  const isTrackTD = DOMUtils.quickMatch("td");

  const allElements = DOMUtils.flattenDOM(dom);

  const artistWebsiteElement = allElements.find(
    element =>
      element.type === "text" && element.data.toLowerCase() === "web site"
  );

  const artistWebsite =
    artistWebsiteElement == null
      ? null
      : artistWebsiteElement.parentNode.attribs.href.split("http://").pop();

  const clumps = allElements
    .filter(
      element =>
        (isTrackDiv(element) || isTrackTD(element)) && element.children != null
    )
    .map(element => element.children);

  return clumps
    .map(pieces => {
      let popularCount = 0;
      const result = {};
      pieces.forEach(piece => {
        switch (piece.name) {
          case "a":
            switch (piece.attribs.class) {
              case "song":
              case "track":
                {
                  result.songName = mineUtils.decodeEntities(
                    piece.children[0].type === "text"
                      ? piece.children[0].data
                      : piece.children[0].children[0].data
                  );
                  let url = mineUtils.decodeEntities(piece.attribs.href);
                  if (url.indexOf("http") !== 0 && url.indexOf("/web") !== 0) {
                    url = `${timestamp}/${url}`;
                  }
                  const urlData = mineUtils.extractURLData(url);
                  if (urlData.song != null) {
                    result.songID = parseFloat(urlData.song);
                  } else if (urlData.track != null) {
                    result.songID = parseFloat(urlData.track);
                  } else if (urlData.id != null) {
                    result.songID = parseFloat(urlData.id);
                  }
                }
                break;
              case "artist":
                result.artistName = mineUtils.decodeEntities(
                  piece.children[0].data
                );
                break;
              default:
            }
            break;
          case "img":
            if (piece.attribs.alt === "Popular Song!") {
              popularCount++;
            }
            break;
          case "font":
            switch (piece.attribs.class) {
              case "popularity":
                popularCount = NaN;
                result.popularity = piece.children[0].data.length;
                break;
              case "artist":
                {
                  const aTag = piece.children.find(child => child.name === "a");
                  if (aTag != null) {
                    result.artistName = mineUtils.decodeEntities(
                      aTag.children[0].data
                    );
                  }
                }
                break;
            }
            break;
        }
      });
      if (popularCount > 0) {
        result.popularity = popularCount;
      }
      if (Object.keys(result).length === 0) {
        result.empty = true;
      }

      if (artistWebsite != null) {
        result.artistWebsite = artistWebsite;
      }
      result.timestamp = timestamp;

      return result;
    })
    .filter(result => !result.empty && result.songName !== "more");
};
