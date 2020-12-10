const fs = require("fs");
const scraper = require("./scraper.js");
const merger = require("./merger.js");

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

/*
const songs = Object.values(latestData.songs).map(song => {
  const usefulKeys = {
    songID: song.songID,
    albumID: song.albumID,
    artistName: song.artistName
  };
  const strings = [
    song.albumName,
    song.artistName,
    song.recordLabelName,
    song.songName,
    song.credit_original,
    song.credit_remix,
    song.credit_by,
    song.credit_mixed,
    song.credit_vocals
  ]
    .filter(s => s)
    .join(" ")
    .replace(/[()]/g, "");
  return { ...usefulKeys, strings };
});

fs.writeFileSync(`./blech.json`, JSON.stringify(songs));
*/
