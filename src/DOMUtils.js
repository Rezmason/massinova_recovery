const linkDOMParents = dom => {
  if (Array.isArray(dom)) {
    dom.map(linkDOMParents);
  } else if (dom.children != null) {
    dom.children.forEach(child => {
      child.parentNode = dom;
      linkDOMParents(child);
    });
  }
};

const flattenDOM = dom => {
  return Array.isArray(dom)
    ? [].concat(...dom.map(flattenDOM))
    : dom.children != null
    ? flattenDOM(dom.children).concat(dom)
    : [dom];
};

const climbDOM = (dom, find) => {
  let element = dom.parentNode;
  while (element != null && !find(element)) element = element.parentNode;
  return element;
};

const quickMatch = (tagName, className = null) => element =>
  element.name === tagName &&
  (className == null || element.attribs.class === className);

module.exports = { linkDOMParents, flattenDOM, climbDOM, quickMatch };
