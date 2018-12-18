const scraper = require("./scraper.js");
const smoosh = require("./smoosh.js");

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
  "credit_by",
  "credit_mixed",
  "credit_original",
  "credit_remix",
  "credit_vocals",
  "credit_vs",
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
        timeline[index - 1] == null ||
        timeline[index - 1].value.toString() !== entry.value.toString()
    );

    if (truncatedTimeline.length === 1) {
      properties[propertyName] = truncatedTimeline[0].value;
    } else if (truncatedTimeline.length > 0) {
      properties[propertyName] = truncatedTimeline;
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

  const songName = Array.isArray(properties.songName)
    ? properties.songName[properties.songName.length - 1].value
    : properties.songName;

  const plays = Array.isArray(properties.plays)
    ? properties.plays[properties.plays.length - 1].value
    : properties.plays;

  return { properties, songID, songName, plays, chart };
};

const mergeArtists = (artistName, data) => {
  const properties = makeTimeline(artistPropertyNames, data);
  return { properties, artistName };
};

const mergeAlbums = (albumID, data) => {
  const properties = makeTimeline(albumPropertyNames, data);

  const albumName = Array.isArray(properties.albumName)
    ? properties.albumName[properties.albumName.length - 1].value
    : properties.albumName;

  return { properties, albumID, albumName };
};

const allSongs = scrapedData.filter(datum => datum.songID != null);
const allSongIDs = new Set(allSongs.map(({ songID }) => songID));
const songDataBySongID = new Map(
  Array.from(allSongIDs.values())
    .map(songID =>
      mergeSongs(songID, allSongs.filter(song => song.songID === songID))
    )
    .map(song => [song.songID, song])
);

const allCreditNames = new Set(
  smoosh(
    scrapedData.map(datum =>
      creditPropertyNames.map(propertyName => datum[propertyName])
    )
  )
);
allCreditNames.delete(undefined);
const allArtists = scrapedData.filter(datum => datum.artistName != null);
const artistDataByArtistName = new Map(
  Array.from(allCreditNames.values())
    .map(artistName =>
      mergeArtists(
        artistName,
        allArtists.filter(artist => artist.artistName === artistName)
      )
    )
    .map(artist => [artist.artistName, artist])
);

const allAlbums = scrapedData.filter(datum => datum.albumID != null);
const allAlbumIDs = new Set(allAlbums.map(({ albumID }) => albumID));
const albumDataByAlbumID = new Map(
  Array.from(allAlbumIDs.values())
    .map(albumID =>
      mergeAlbums(albumID, allAlbums.filter(album => album.albumID === albumID))
    )
    .map(album => [album.albumID, album])
);

console.log(
  JSON.stringify({
    songs: Array.from(songDataBySongID.values()),
    artists: Array.from(artistDataByArtistName.values()),
    albums: Array.from(albumDataByAlbumID.values())
  })
);
