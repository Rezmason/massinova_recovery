const scraper = require("./scraper.js");

const scrapedData = scraper.buildScrapedData(
  `./data`,
  `./data.json`,
  `./scraped.json`
);

console.log(scrapedData);
