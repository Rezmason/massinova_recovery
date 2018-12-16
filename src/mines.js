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

const buildMineSources = (dataPath, dataJsonPath) => {
  if (!fs.existsSync(dataJsonPath)) {
    console.log("Creating data JSON...");
    console.time("createDataJSON");
    fs.writeFileSync(
      dataJsonPath,
      JSON.stringify(
        getMineSources(dataPath).filter(
          mineSource => mineSource.files.length > 0
        ),
        null,
        " "
      )
    );
    console.timeEnd("createDataJSON");
  }

  console.log("Loading data JSON...");
  console.time("loadDataJSON");
  const mineSources = JSON.parse(fs.readFileSync(dataJsonPath));
  console.timeEnd("loadDataJSON");
  return mineSources;
};

module.exports = { buildMineSources };
