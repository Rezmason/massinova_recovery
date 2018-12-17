const fs = require("fs");
const scraper = require("./scraper.js");

const scrapedData = scraper.buildScrapedData(
  `./data`,
  `./data.json`,
  `./scraped.json`
);

console.log("Loading override JSON...");
console.time("loadOverrideJSON");
const overrideJSON = JSON.parse(fs.readFileSync(`./override.json`));
console.timeEnd("loadOverrideJSON");

const songs = scrapedData.filter(
  datum => datum.songID != null || datum.songName != null
);
// Fix songs
const songOverrides = overrideJSON.songName_songID;
songs.forEach(song => {
  if (songOverrides[song.songName] != null)
    song.songID = songOverrides[song.songName];
});

// const artists = scrapedData.filter(datum => datum.artistName != null);
const albums = scrapedData.filter(
  datum => datum.albumID != null || datum.albumName != null
);
// Fix albums
const albumOverrides = overrideJSON.albumName_albumID;
albums.forEach(album => {
  if (albumOverrides[album.albumName] != null)
    album.albumID = albumOverrides[album.albumName];
});
