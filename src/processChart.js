const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

module.exports = (dom, timestamp, chartType) => {
  const pieces = DOMUtils.flattenDOM(dom)
    .filter(
      element => element.type === "text" && element.parentNode.type !== "script"
    )
    .map(element => {
      const result = { data: element.data };
      const aTag = DOMUtils.climbDOM(element, DOMUtils.quickMatch("a"));
      if (aTag) {
        let url = mineUtils.decodeEntities(aTag.attribs.href);
        if (url.indexOf("http") !== 0 && url.indexOf("/web") !== 0) {
          url = `${timestamp}/${url}`;
        }
        [result.class, result.urlData] = [
          aTag.attribs.class,
          mineUtils.extractURLData(url)
        ];
      } else {
        const fontTag = DOMUtils.climbDOM(element, DOMUtils.quickMatch("font"));
        if (fontTag) {
          result.class = fontTag.attribs.class;
        }
      }
      return result;
    });

  const rankClasses = ["location", "data", "rank"];

  const clumps = mineUtils.clump(pieces, piece =>
    rankClasses.includes(piece.class)
  );

  const records = clumps.map(clump => {
    const record = { timestamp, chartType };
    clump.forEach(piece => {
      if (piece.urlData != null) {
        if (piece.urlData.id != null) {
          record.songID = parseFloat(piece.urlData.id);
          record.songName = mineUtils.decodeEntities(piece.data);
        } else if (piece.urlData.track != null) {
          record.songID = parseFloat(piece.urlData.track);
          record.songName = mineUtils.decodeEntities(piece.data);
        } else if (piece.urlData.artist != null) {
          record.artistName = piece.urlData.artist;
        }
      } else if (rankClasses.includes(piece.class)) {
        record.chartRank = parseFloat(mineUtils.decodeEntities(piece.data));
      }
    });
    return record;
  });

  return records;
};
