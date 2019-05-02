const fs = require("fs");
const smoosh = require("./smoosh.js");

const earlierTimelineEntry = (e1, e2) => e1.timestamp - e2.timestamp;

const lookup = "lookup";
const guess = "guess";

const songPropertyNames = {
  songID: lookup,
  songName: lookup,
  bpm: lookup,
  credit_by: lookup,
  credit_mixed: null,
  credit_original: null,
  credit_remix: null,
  credit_vocals: null,
  credit_vs: null,
  dateAdded: null,
  duration: lookup,
  genres: null,

  lastPlayed: null,
  plays: guess,
  popularity: guess,
  requests: guess,

  artistName: lookup,
  albumID: lookup
};
const artistPropertyNames = {
  artistName: lookup,
  artistInfo_from: null,
  artistInfo_started: null,
  artistInfo_born: null,
  artistWebsite: null,
  bioPage1: null,
  bioPage2: null,
  bioPage3: null,
  bioWriter: null
};
const albumPropertyNames = {
  albumName: lookup,
  albumID: lookup,
  albumCDNowURL: null,
  recordLabelName: lookup
};

const creditPropertyNames = [
  "artistName",
  "credit_by",
  "credit_mixed",
  "credit_original",
  "credit_remix",
  "credit_vocals",
  "credit_vs"
];

const makeTimeline = (propertyNames, data) => {
  const properties = {};
  Object.keys(propertyNames).forEach(propertyName => {
    const timeline = [];
    data.forEach(datum => {
      if (datum[propertyName] != null)
        timeline.push({
          timestamp: datum.timestamp,
          value: datum[propertyName]
        });
    });
    timeline.sort(earlierTimelineEntry);

    const truncatedTimeline = timeline.filter(
      (entry, index) =>
        timeline[index - 1] == null ||
        timeline[index - 1].value.toString() !== entry.value.toString()
    );

    if (truncatedTimeline.length === 1) {
      properties[propertyName] = truncatedTimeline[0].value;
    } else if (truncatedTimeline.length > 0) {
      properties[propertyName] = {};
      truncatedTimeline.forEach(
        ({ timestamp, value }) => (properties[propertyName][timestamp] = value)
      );
    } else if (propertyNames[propertyName]) {
      properties[propertyName] = `__${
        propertyNames[propertyName]
      }__${propertyName}__`;
    }
  });
  return properties;
};

const makeChart = data => {
  const chartTypes = Array.from(
    new Set(
      data
        .filter(datum => datum.chartType != null)
        .map(({ chartType }) => chartType)
    ).values()
  );
  const chart = {};
  chartTypes.forEach(chartType => {
    const timeline = [];
    data.forEach(datum => {
      if (datum.chartType === chartType)
        timeline.push({
          timestamp: datum.timestamp,
          value: datum.chartRank
        });
    });
    timeline.sort(earlierTimelineEntry);
    chart[chartType] = timeline;
  });
  return chart;
};

const mergeSongs = (songID, data) => {
  const properties = makeTimeline(songPropertyNames, data);
  const chart = makeChart(data);
  return Object.assign(
    { songID },
    properties,
    {
      plays:
        typeof properties.plays === "object"
          ? properties.plays[
              Object.keys(properties.plays)
                .sort(earlierTimelineEntry)
                .pop()
            ].value
          : properties.plays
    },
    Object.keys(chart).length === 0 ? {} : { chart }
  );
};

const arrayToObject = (keyPropertyname, entries) => {
  const result = {};
  entries.forEach(entry => (result[entry[keyPropertyname]] = entry));
  return result;
};

const mergeArtists = (artistName, data) =>
  Object.assign({ artistName }, makeTimeline(artistPropertyNames, data));

const mergeAlbums = (albumID, data) =>
  Object.assign({ albumID }, makeTimeline(albumPropertyNames, data));

const mergeData = (scrapedData, mergedJsonPath) => {
  if (!fs.existsSync(mergedJsonPath)) {
    console.log("Merging songs...");
    console.time("mergeSongs");
    const allSongs = scrapedData.filter(datum => datum.songID != null);
    const allSongIDs = new Set(allSongs.map(({ songID }) => songID));
    const mergedSongs = arrayToObject(
      "songID",
      Array.from(allSongIDs.values()).map(songID =>
        mergeSongs(songID, allSongs.filter(song => song.songID === songID))
      )
    );
    console.timeEnd("mergeSongs");

    console.log("Merging artists...");
    console.time("mergeArtists");
    const allCreditNames = new Set(
      smoosh(
        scrapedData.map(datum =>
          creditPropertyNames.map(propertyName => datum[propertyName])
        )
      )
    );
    allCreditNames.delete(undefined);
    const allArtists = scrapedData.filter(datum => datum.artistName != null);
    const mergedArtists = arrayToObject(
      "artistName",
      Array.from(allCreditNames.values())
        .map(artistName =>
          mergeArtists(
            artistName,
            allArtists.filter(artist => artist.artistName === artistName)
          )
        )
        .filter(({ artistName }) => !artistName.startsWith("__missing__"))
    );
    console.timeEnd("mergeArtists");

    console.log("Merging albums...");
    console.time("mergeAlbums");
    const allAlbums = scrapedData.filter(datum => datum.albumID != null);
    const allAlbumIDs = new Set(allAlbums.map(({ albumID }) => albumID));
    const mergedAlbums = arrayToObject(
      "albumID",
      Array.from(allAlbumIDs.values())
        .map(albumID =>
          mergeAlbums(
            albumID,
            allAlbums.filter(album => album.albumID === albumID)
          )
        )
        .filter(({ albumName }) => !albumName.startsWith("__missing__"))
    );
    console.timeEnd("mergeAlbums");

    const mergeOutput = {
      songs: mergedSongs,
      artists: mergedArtists,
      albums: mergedAlbums
    };
    console.log("Creating merged JSON...");
    console.time("createMergedJSON");
    fs.writeFileSync(mergedJsonPath, JSON.stringify(mergeOutput, null, " "));
    console.timeEnd("createMergedJSON");
  }

  console.log("Loading merged JSON...");
  console.time("loadMergedJSON");
  const mergedJSON = JSON.parse(fs.readFileSync(mergedJsonPath));
  console.timeEnd("loadMergedJSON");
  return mergedJSON;
};

module.exports = { mergeData };
