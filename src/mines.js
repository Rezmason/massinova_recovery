const fs = require("fs");
const htmlparser = require("htmlparser");

const handler = new htmlparser.DefaultHandler(null, {
  verbose: false,
  ignoreWhitespace: true
});
const parser = new htmlparser.Parser(handler);

const getContentPaths = folderPath =>
  fs
    .readdirSync(folderPath)
    .filter(path => path[0] !== ".")
    .map(path => `${folderPath}/${path}`);

const nonBreakingSpaces = /&nbsp;/g;
const newlines = /[\n\r]/g;
const getMineSources = folderPath => {
  const contentStats = getContentPaths(folderPath).map(path => ({
    path,
    isDirectory: fs.lstatSync(path).isDirectory()
  }));
  return [
    {
      mineID: folderPath.replace(/[^\w]+/g, " ").trim(),
      files: contentStats
        .filter(stat => !stat.isDirectory)
        .map(stat => {
          parser.parseComplete(
            fs
              .readFileSync(stat.path, "utf8")
              .replace(nonBreakingSpaces, " ")
              .replace(newlines, " ")
          );
          return { path: stat.path, dom: handler.dom };
        })
    }
  ].concat(
    ...contentStats
      .filter(stat => stat.isDirectory)
      .map(stat => getMineSources(stat.path))
  );
};

const buildMineSources = (dataPath, jsonPath) => {
  if (!fs.existsSync(jsonPath)) {
    console.log("Creating data JSON...");
    console.time("createJSON");
    fs.writeFileSync(
      jsonPath,
      JSON.stringify(
        getMineSources(dataPath).filter(
          mineSource => mineSource.files.length > 0
        ),
        null,
        " "
      )
    );
    console.timeEnd("createJSON");
  }

  console.log("Loading data JSON...");
  console.time("loadJSON");
  const mineSources = JSON.parse(fs.readFileSync(jsonPath));
  console.timeEnd("loadJSON");
  return mineSources;
};

module.exports = { buildMineSources };
