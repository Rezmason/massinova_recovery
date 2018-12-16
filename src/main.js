const mines = require("./mines.js");
const DOMUtils = require("./DOMUtils.js");
const smoosh = require("./smoosh.js");
const fs = require("fs");

const miners = require("./miners.js");

const mineSources = mines.buildMineSources(`./data`, `./data.json`);
const justOne = false;

console.log("Linking dom elements to parents...");
console.time("linkDOMParents");
mineSources.forEach(mineSource =>
  mineSource.files.forEach(file => DOMUtils.linkDOMParents(file.dom))
);
console.timeEnd("linkDOMParents");

console.log("Mining...");
console.time("mining");
const mineOutput = smoosh(
  mineSources.map(mineSource => {
    // console.time(mineSource.mineID);
    const data = miners[mineSource.mineID](
      justOne ? [mineSource.files[0]] : mineSource.files
    );
    // console.timeEnd(mineSource.mineID);
    return data;
  })
);
console.timeEnd("mining");

const scrapedJsonPath = `./scraped.json`;
console.log("Creating scraped JSON...");
console.time("createScrapedJSON");
fs.writeFileSync(scrapedJsonPath, JSON.stringify(mineOutput, null, " "));
console.timeEnd("createScrapedJSON");
