const fs = require("fs");

const createSongTSV = (data, outputPath) => {
  const columns = [
    "songID",
    "songName",
    "artistName",
    "albumID",
    "albumName",
    "recordLabelName",
    "duration",
    "bpm",
    "dateAdded",
    "lastPlayed",
    "popularity",
    "requests",
    "credit_by",
    "plays",
    "genres",
    "credit_original",
    "credit_remix",
    "credit_mixed",
    "credit_vocals"
  ];

  const convertToCell = (key, value) => {
    if (value == null) {
      return "";
    }
    if (Array.isArray(value)) {
      return value.join(",");
    } else if (typeof value === "object") {
      const lastKey = Object.keys(value)
        .sort()
        .pop();
      value = value[lastKey];
    }
    return value.toString();
  };

  const songs = Object.values(data.songs).map(song =>
    columns.map(key => convertToCell(key, song[key])).join("\t")
  );
  fs.writeFileSync(outputPath, [columns.join("\t"), ...songs].join("\n"));
};

module.exports = { createSongTSV };
