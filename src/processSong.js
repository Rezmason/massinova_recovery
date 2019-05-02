const DOMUtils = require("./DOMUtils.js");
const mineUtils = require("./mineUtils.js");

const numeric = /(\d+)/;
const durationPattern = /\[(\d+):(\d+)\]/;
const requestsPattern = /(\d+) requests/;
const playsPattern = /(\d+) plays/;
const dateFormatter = new Intl.DateTimeFormat("en-us", {
  month: "short",
  year: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
});
const lastPlayedPiecePattern = /(\d+ \w+)/g;
const isFontTag = DOMUtils.quickMatch("font");
const isATag = DOMUtils.quickMatch("a");
const isTitleFontTag = element =>
  (element.attribs.face === "Tahoma,Helvetica,Arial,sans-serif" &&
    element.attribs.size === "5") ||
  element.attribs.class === "track-title";

const timeSpansInSeconds = {};
timeSpansInSeconds.minute = 60;
timeSpansInSeconds.hour = timeSpansInSeconds.minute * 60;
timeSpansInSeconds.day = timeSpansInSeconds.hour * 24;
timeSpansInSeconds.week = timeSpansInSeconds.day * 7;
timeSpansInSeconds.month = timeSpansInSeconds.day * 30;
timeSpansInSeconds.year = timeSpansInSeconds.day * 365;
const computeLastPlayed = (time, lastPlayed) => {
  const components = lastPlayed.match(lastPlayedPiecePattern);
  if (components == null) {
    return null;
  }
  let secondsAgo = 0;
  components
    .map(component => component.split(/\s+/))
    .forEach(([digits, label]) => {
      const amount = parseInt(digits);
      label = label.replace(/[s,]/g, "");
      secondsAgo += timeSpansInSeconds[label] * amount;
    });
  return dateFormatter.format(new Date(time - secondsAgo * 1000));
};

module.exports = (dom, timestamp, songID) => {
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hour = timestamp.substring(8, 10);
  const minute = timestamp.substring(10, 12);
  const second = timestamp.substring(12, 14);
  const time = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}`
  ).getTime();
  const allElements = DOMUtils.flattenDOM(dom);
  const result = {};

  const albumArt = allElements
    .filter(
      element =>
        element.name === "img" && element.attribs.src.includes("/albums/")
    )
    .map(element => element.attribs.src.split("/albums/").pop());

  if (albumArt.length > 0) {
    result.albumID = parseFloat(numeric.exec(albumArt[0])[0]);
  }

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
      if (
        durationData != null &&
        (parseInt(durationData[1]) > 0 || parseInt(durationData[2]) > 0)
      ) {
        result.duration = `${durationData[1]}:${durationData[2]}`;
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
              const albumID = parseFloat(urlData.album);
              if (result.albumID != null && result.albumID !== albumID) {
                throw new Error(`album ID mismatch: ${timestamp}`);
              }
              result.albumID = albumID;
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
                if (text.includes("added") && text.trim() !== "added ,") {
                  result.dateAdded = text.split("added")[1].trim();
                } else if (text.includes("last played")) {
                  const lastPlayed = computeLastPlayed(
                    time,
                    text.split("last played")[1].trim()
                  );
                  if (lastPlayed != null) {
                    result.lastPlayed = lastPlayed;
                  }
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
      result.artistName = artistNames[0].text;
    } else {
      const credits = {};
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
