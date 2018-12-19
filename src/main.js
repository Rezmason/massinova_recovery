const scraper = require("./scraper.js");
const merger = require("./merger.js");

merger.mergeData(
  scraper.buildScrapedData(
    `./data`,
    `./data.json`,
    `./scraped.json`,
    `./override.json`
  ),
  `./merged.json`
);
