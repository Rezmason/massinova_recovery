const fs = require("fs");
const mines = require("./mines.js");
const DOMUtils = require("./DOMUtils.js");
const smoosh = require("./smoosh.js");
const miners = require("./miners.js");

const buildScrapedData = (dataPath, dataJsonPath, scrapedJsonPath) => {
  if (!fs.existsSync(scrapedJsonPath)) {
    const mineSources = mines.buildMineSources(dataPath, dataJsonPath);

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
        const data = miners[mineSource.mineID](mineSource.files);
        // console.timeEnd(mineSource.mineID);
        return data;
      })
    );
    console.timeEnd("mining");

    console.log("Creating scraped JSON...");
    console.time("createScrapedJSON");
    fs.writeFileSync(scrapedJsonPath, JSON.stringify(mineOutput, null, " "));
    console.timeEnd("createScrapedJSON");
  }

  console.log("Loading scraped JSON...");
  console.time("loadScrapedJSON");
  const scrapedJSON = JSON.parse(fs.readFileSync(scrapedJsonPath));
  console.timeEnd("loadScrapedJSON");
  return scrapedJSON;
};

module.exports = { buildScrapedData };
