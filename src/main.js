const fs = require("fs");
const scraper = require("./scraper.js");
const merger = require("./merger.js");
const spreadsheeter = require("./spreadsheeter.js");

const latestData = merger.mergeData(
  scraper.buildScrapedData(
    `./data`,
    `./data.json`,
    `./scraped.json`,
    `./override.json`,
    false
  ),
  `./merged.json`,
  true
);

const parentheticals = /\s*\([^)]+\)/g;
const apostrophes = /'/g;
fs.writeFileSync(
  `./discogs/wgetsongs.sh`,
  Object.values(latestData.songs)
    .map(song => {
      const { songID, songName, artistName, albumID } = song;
      const album = latestData.albums[albumID];
      const { albumName, recordLabelName } = album || {};

      const safeSongName = songName
        .replace(parentheticals, "")
        .replace(apostrophes, "");

      const filename = `./search/song_${songID}_${songName}.json`;
      const url = `https://api.discogs.com/database/search?token=nxxJkARXfQpFJZddoKXRiVnkQyNHjXRjODjvoOOE&type=release&artist=${artistName}&track=${safeSongName}`;

      songID, songName, artistName, albumID, albumName, recordLabelName;
      return `URL="${url}"; FILE="${filename}"; wget -nc "$URL" -O "$FILE" && sleep 1`;
    })
    .join("\n")
);

spreadsheeter.createSongTSV(latestData, `./tracklist.tsv`);
