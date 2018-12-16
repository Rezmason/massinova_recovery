const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

const numeric = /(\d+)/;
const durationPattern = /\[(\d+):(\d+)\]/;
const requestsPattern = /(\d+) requests/;
const playsPattern = /(\d+) plays/;
const isFontTag = DOMUtils.quickMatch("font");
const isATag = DOMUtils.quickMatch("a");
const isTitleFontTag = element =>
  (element.attribs.face === "Tahoma,Helvetica,Arial,sans-serif" &&
    element.attribs.size === "5") ||
  element.attribs.class === "track-title";

module.exports = (dom, timestamp, songID) => {
  const allElements = DOMUtils.flattenDOM(dom);
  const result = {};

  let popularCount = allElements.filter(
    element => element.name === "img" && element.attribs.alt === "Popular Song!"
  ).length;
  const artistElements = [];
  allElements
    .filter(
      element => element.type === "text" && element.parentNode.type === "tag"
    )
    .forEach(element => {
      const text = mineUtils.decodeEntities(element.data);
      const fontTag = DOMUtils.climbDOM(element, isFontTag);
      const aTag = DOMUtils.climbDOM(element, isATag);

      const durationData = durationPattern.exec(text);
      if (durationData != null) {
        result.duration = {
          minutes: durationData[1],
          seconds: durationData[2]
        };
      } else if (aTag != null) {
        if (aTag.attribs.class === "album" || aTag.attribs.target === "album") {
          result.albumName = text;
        }
        let url = mineUtils.decodeEntities(aTag.attribs.href);
        if (url.length > 0) {
          if (url.indexOf("http") !== 0 && url.indexOf("/web") !== 0) {
            url = `${timestamp}/${url}`;
          }
          if (url.includes("cdnow")) {
            result.albumCDNowURL = url.split("http://").pop();
          } else if (!url.includes("/unknown")) {
            const urlData = mineUtils.extractURLData(url);
            if (urlData.artist != null) {
              artistElements.push({ type: "artist", text: urlData.artist });
            }
            if (urlData.album != null) {
              result.albumID = parseFloat(urlData.album);
            }
          }
        }
      } else if (fontTag != null) {
        if (isTitleFontTag(fontTag)) {
          result.songName = text;
        } else {
          switch (fontTag.attribs.class) {
            case "byline":
              artistElements.push({ type: "byline", text: text.trim() });
              break;
            case "data":
              {
                if (text.includes("added")) {
                  result.dateAdded = text.split("added")[1].trim();
                } else if (text.includes("last played")) {
                  result.lastPlayed = text.split("last played")[1].trim();
                } else if (
                  text.includes("requests") ||
                  text.includes("plays")
                ) {
                  const requestsData = requestsPattern.exec(text);
                  if (requestsData != null)
                    result.requests = parseFloat(requestsData[1]);
                  const playsData = playsPattern.exec(text);
                  if (playsData != null)
                    result.plays = parseFloat(playsData[1]);
                } else {
                  artistElements.push({ type: "extraData", text: text.trim() });
                }
              }
              break;
            case "popularity":
            case "total-empty-slot":
              result.popularity = text.length;
              break;
            case "highlight":
              result.genres = text.split(", ");
              break;
            case "album":
              result.recordLabelName = text;
              break;
            case "requests":
              result.requests = parseFloat(numeric.exec(text)[0]);
              break;
          }
        }
      } else if (text.includes("BPM")) {
        result.bpm = parseFloat(numeric.exec(text)[0]);
      }
    });

  const artistNames = artistElements.filter(
    element => element.type === "artist"
  );
  if (artistNames.length > 0) {
    if (artistNames.length === 1) {
      result.artist = artistNames[0].text;
    } else {
      result.credits = {};
      let credit = null;
      let artist = null;
      artistElements.forEach(({ type, text }) => {
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
          result.credits[credit] = artist;
          credit = null;
          artist = null;
        }
      });

      if (result.credits.by != null) {
        result.artist = result.credits.by;
      } else if (result.credits.original != null) {
        result.artist = result.credits.original;
      }
    }
  }

  if (popularCount > 0) {
    result.popularity = popularCount;
  }

  if (Object.keys(result).length === 0) {
    result.empty = true;
  }

  result.timestamp = timestamp;
  result.songID = songID;
  return result;
};
