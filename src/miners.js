const mineUtils = require("./mineUtils.js");
const DOMUtils = require("./DOMUtils.js");

const processChart = require("./processChart.js");
const processAlbum = require("./processAlbum.js");
const processAlbumIndex = require("./processAlbumIndex.js");
const processArtist = require("./processArtist.js");
const processArtistIndex = require("./processArtistIndex.js");
const processDownURL = require("./processDownURL.js");
const processSong = require("./processSong.js");
const processRequest = require("./processRequest.js");
const processBio = require("./processBio.js");
const smoosh = require("./smoosh.js");

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
    return smoosh(extractedSourceData);
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
    return smoosh(extractedSourceData);
  },

  "data music html album_ pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processAlbumIndex(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html albums": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processAlbumIndex(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html artist down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return smoosh(extractedSourceData);
  },

  "data music html artist_ pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html artist pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html artists": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html lib artist artist down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return smoosh(extractedSourceData);
  },

  "data music html lib artist artist pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html pa down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return smoosh(extractedSourceData);
  },

  "data request html song down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return smoosh(extractedSourceData);
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
    return smoosh(extractedSourceData);
  },

  "data song html id down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return smoosh(extractedSourceData);
  },

  "data playing down": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      return processDownURL(path);
    });
    return smoosh(extractedSourceData);
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
    return smoosh(extractedSourceData);
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
    return smoosh(extractedSourceData);
  },

  "data music html pa v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtistIndex(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html album_ v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      const albumID = parseFloat(filenameData.album);

      return processAlbum(dom, timestamp, albumID);
    });
    return smoosh(extractedSourceData);
  },

  "data music html artist v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html artist_ v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html artists_": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html lib artist artist v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html track_ pages": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data playing v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data playing v2": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data requests v1": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data requests v2": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      return processArtist(dom, timestamp);
    });
    return smoosh(extractedSourceData);
  },

  "data music html track_ v2": files => {
    const extractedSourceData = files
      .map(({ path, dom }) => {
        const filenameData = mineUtils.extractFilenameData(path);
        const timestamp = filenameData.timestamp;
        const songID = parseFloat(filenameData.track);
        return processSong(dom, timestamp, songID);
      })
      .filter(song => song.empty == null);
    return smoosh(extractedSourceData);
  },

  "data song html id v1": files => {
    const extractedSourceData = files
      .map(({ path, dom }) => {
        const filenameData = mineUtils.extractFilenameData(path);
        const timestamp = filenameData.timestamp;
        const songID = parseFloat(filenameData.id);
        return processSong(dom, timestamp, songID);
      })
      .filter(song => song.empty == null);
    return smoosh(extractedSourceData);
  },

  "data request html song v1": files => {
    const extractedSourceData = files
      .map(({ path, dom }) => {
        const filenameData = mineUtils.extractFilenameData(path);
        const timestamp = filenameData.timestamp;
        const songID = parseFloat(filenameData.song);
        return processRequest(dom, timestamp, songID);
      })
      .filter(song => song.empty == null);
    return smoosh(extractedSourceData);
  },

  "data music html lib artist artist bio": files => {
    const extractedSourceData = files.map(({ path, dom }) => {
      const filenameData = mineUtils.extractFilenameData(path);
      const timestamp = filenameData.timestamp;
      const artistName = mineUtils
        .decodeEntities(filenameData.artist)
        .replace(" bio", "");
      const bioPage = filenameData.ps != null ? parseFloat(filenameData.ps) : 1;
      return processBio(dom, timestamp, artistName, bioPage);
    });
    return smoosh(extractedSourceData);
  }
};
