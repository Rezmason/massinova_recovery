const querystring = require("querystring");
const he = require("he");

const filenameRipper = /(\d+)_.*?\.html?(\??)(.*)_\.html/;
const urlRipper = /(\d+)\/.*?\.html?(\??)(.*)/;
const ampersands = /\+&\+/g;
const pilcrows = /¶/g;
const parseQueryString = query => {
  const result = querystring.parse(query.replace(ampersands, " ¶ "));
  Object.entries(result).forEach(([key, value]) => {
    if (value === "" && key.includes("_")) {
      delete result[key];
      const [betterKey, betterValue] = key.split("_");
      result[betterKey] = betterValue.replace(pilcrows, "&");
    } else if (value === "" && key.includes("/")) {
      delete result[key];
      const [betterKey, betterValue] = key.split("/");
      result[betterKey] = betterValue.replace(pilcrows, "&");
    } else {
      result[key] = value.replace(pilcrows, "&");
    }
  });
  return result;
};

const extractFilenameData = filename => {
  const matches = filenameRipper.exec(filename);
  if (matches == null) {
    console.warn(`NO MATCH: ${filename}`);
    return { filename, NO_MATCH: "" };
  }
  const timestamp = parseFloat(matches[1]);
  const data = matches[2] === "?" ? parseQueryString(matches[3]) : {};
  return Object.assign(data, { filename, timestamp });
};

const extractURLData = url => {
  const matches = urlRipper.exec(url);
  if (matches == null) {
    console.warn(`NO MATCH: ${url}`);
    return { url, NO_MATCH: "" };
  }
  const timestamp = parseFloat(matches[1]);
  const data = matches[2] === "?" ? parseQueryString(matches[3]) : {};
  return Object.assign(data, { url, timestamp });
};

const clump = (data, startPredicate) => {
  const startIndices = data
    .map((datum, index) => ({ datum, index }))
    .filter(({ datum }) => startPredicate(datum))
    .map(({ index }) => index);
  return startIndices.map((_, i) =>
    data.slice(
      startIndices[i],
      i + 1 < startIndices.length ? startIndices[i + 1] : undefined
    )
  );
};

const decodeEntities = he.decode;

module.exports = { extractFilenameData, extractURLData, clump, decodeEntities };
