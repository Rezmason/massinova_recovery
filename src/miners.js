const mineUtils = require("./mineUtils.js");
const DOMUtils = require("./DOMUtils.js");

const processChart = require("./processChart.js");
const processAlbum = require("./processAlbum.js");
const processAlbumIndex = require("./processAlbumIndex.js");
const processArtistIndex = require("./processArtistIndex.js");
const processDownURL = require("./processDownURL.js");

module.exports = {
  "data chart": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      let chartType = "top";
      if (filenameData.chart != null) {
        chartType = filenameData.chart;
        if (chartType === "unplayed") chartType = "noplay";
      }
      return processChart(dom, timestamp, chartType);
    });
    return extractedSourceData;
  },

  "data charts": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      let chartType = "top";
      ["bottom", "fav", "new", "noplay", "rand", "recent", "top"].forEach(
        type => {
          if (filenameData[type] != null) chartType = type;
        }
      );
      return processChart(dom, timestamp, chartType);
    });
    return extractedSourceData;
  },

  "data music html album_ pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processAlbumIndex(dom, timestamp);
    });
    return extractedSourceData;
  },

  "data music html albums": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processAlbumIndex(dom, timestamp);
    });
    return extractedSourceData;
  },

  "data music html artist down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return extractedSourceData;
  },

  "data music html artist_ pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return extractedSourceData;
  },

  "data music html artist pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return extractedSourceData;
  },

  "data music html artists": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return extractedSourceData;
  },

  "data music html lib artist artist down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return extractedSourceData;
  },

  "data music html lib artist artist pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return extractedSourceData;
  },

  "data music html pa down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return extractedSourceData;
  },

  "data request html song down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return extractedSourceData;
  },

  "data request html song requesterror": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return [
        {
          timestamp,
          songID: parseFloat(filenameData.song)
        }
      ];
    });
    return extractedSourceData;
  },

  "data song html id down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return extractedSourceData;
  },

  "data playing down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return extractedSourceData;
  },

  "data music html artist_ bio": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return DOMUtils.flattenDOM(dom)
        .filter(
          element =>
            element.type === "text" &&
            DOMUtils.climbDOM(
              element,
              DOMUtils.quickMatch("font", "artist-title")
            ) != null
        )
        .map(element => ({
          timestamp,
          artistName: mineUtils.decodeEntities(element.data)
        }));
    });
    return extractedSourceData;
  },

  "data request html": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return [
        {
          timestamp,
          songID: Object.keys(filenameData)
            .map(parseFloat)
            .find(id => !isNaN(id))
        }
      ];
    });
    return extractedSourceData;
  },

  "data music html pa v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return extractedSourceData;
  },

  "data music html album_ v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      const albumID = parseFloat(filenameData.album);

      return processAlbum(dom, timestamp, albumID);
    });
    return extractedSourceData;
  }
};
