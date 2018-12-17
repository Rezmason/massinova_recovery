const scraper = require("./scraper.js");

const scrapedData = scraper.buildScrapedData(
  `./data`,
  `./data.json`,
  `./scraped.json`,
  `./override.json`
);

const earlierTimelineEntry = (e1, e2) => e1.timestamp - e2.timestamp;

const songPropertyNames = [
  "songName",
  "bpm",
  "chartRank",
  "chartType",
  "credits",
  "dateAdded",
  "duration",
  "genres",
  "lastPlayed",
  "numRequests",
  "plays",
  "popularity",
  "requests"
];
const artistPropertyNames = [
  "artistInfo_from",
  "artistInfo_started",
  "artistInfo_born",
  "artistWebsite",
  "bioPage1",
  "bioPage2",
  "bioPage3",
  "bioWriter"
];
const albumPropertyNames = ["albumName", "albumCDNowURL", "recordLabelName"];

const makeTimeline = (propertyNames, data) => {
  const properties = {};
  propertyNames.forEach(propertyName => {
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
        timeline[index - 1] == null || timeline[index - 1].value !== entry.value
    );

    if (truncatedTimeline.length === 1) {
      properties[propertyName] = truncatedTimeline[0].value;
    } else if (truncatedTimeline.length > 0) {
      properties[propertyName] = truncatedTimeline;
    }
  });
  return properties;
};

const mergeSongs = data => {
  const songID = data[0].songID;
  const properties = makeTimeline(songPropertyNames, data);

  const songName = Array.isArray(properties.songName)
    ? properties.songName[properties.songName.length - 1].value
    : properties.songName;

  return { songID, songName, properties };
};

const mergeArtists = data => {
  const artistName = data[0].artistName;
  const properties = makeTimeline(artistPropertyNames, data);
  return { artistName, properties };
};

const mergeAlbums = data => {
  const albumID = data[0].albumID;
  const properties = makeTimeline(albumPropertyNames, data);

  const albumName = Array.isArray(properties.albumName)
    ? properties.albumName[properties.albumName.length - 1].value
    : properties.albumName;

  return { albumID, albumName, properties };
};

const allSongs = scrapedData.filter(datum => datum.songID != null);
const allSongIDs = new Set(allSongs.map(({ songID }) => songID));
const songData = Array.from(allSongIDs.values()).map(songID =>
  mergeSongs(allSongs.filter(song => song.songID === songID))
);

const allArtists = scrapedData.filter(datum => datum.artistName != null);
const allArtistIDs = new Set(allArtists.map(({ artistName }) => artistName));
const artistData = Array.from(allArtistIDs.values()).map(artistName =>
  mergeArtists(allArtists.filter(artist => artist.artistName === artistName))
);

const allAlbums = scrapedData.filter(datum => datum.albumID != null);
const allAlbumIDs = new Set(allAlbums.map(({ albumID }) => albumID));
const albumData = Array.from(allAlbumIDs.values()).map(albumID =>
  mergeAlbums(allAlbums.filter(album => album.albumID === albumID))
);
