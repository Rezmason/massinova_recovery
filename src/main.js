const mines = require("./mines.js");
const DOMUtils = require("./DOMUtils.js");

const unfinishedMiners = require("./unfinishedMiners.js");
const finishedMiners = require("./miners.js");

const miners = { ...unfinishedMiners, ...finishedMiners };
const mineSources = mines.buildMineSources(`./data`, `./data.json`);
const justOne = false;

console.log("Linking dom elements to parents...");
console.time("linkDOMParents");
mineSources.forEach(mineSource =>
  mineSource.files.forEach(file => DOMUtils.linkDOMParents(file.dom))
);
console.timeEnd("linkDOMParents");
const mineOutput = mineSources.map(mineSource =>
  miners[mineSource.mineID](justOne ? [mineSource.files[0]] : mineSource.files)
);

mineOutput;
