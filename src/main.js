const fs = require("fs");
const scraper = require("./scraper.js");
const merger = require("./merger.js");

const latestData = merger.mergeData(
  scraper.buildScrapedData(
    `./data`,
    `./data.json`,
    `./scraped.json`,
    `./override.json`
  ),
  `./merged.json`
);

console.log("Saving latest JSON...");
console.time("saveLatestJSON");
fs.writeFileSync(
  `./output_${Date.now()}.json`,
  JSON.stringify(latestData, null, "    ")
);
console.timeEnd("saveLatestJSON");
