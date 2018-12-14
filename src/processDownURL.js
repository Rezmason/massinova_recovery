const mineUtils = require("./mineUtils.js");

module.exports = path => {
  const filenameData = mineUtils.extractFilenameData(path);
  const timestamp = filenameData.timestamp;
  const result = {
    timestamp
  };
  if (filenameData.artist != null) {
    result.artistName = filenameData.artist;
  }
  if (filenameData.song != null) {
    result.songID = parseFloat(filenameData.song);
  }
  if (filenameData.id != null) {
    if (path.includes("song")) {
      if (result.songID == null) {
        result.songID = parseFloat(filenameData.id);
      } else if (result.songID !== parseFloat(filenameData.id)) {
        console.warn("MISMATCH:", filenameData);
      }
    }
  }
  return result;
};
