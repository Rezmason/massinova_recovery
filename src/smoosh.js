const smoosh = ds => (Array.isArray(ds[0]) ? [].concat(...ds.map(smoosh)) : ds);
module.exports = smoosh;
