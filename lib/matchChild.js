"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchChild = matchChild;


/**
 * Get rules for selectors nested within parent node
 *
 * @param {obj} PostCSS CSS object
 * @return {object} Parent rule for which children should be included
 */
function matchChild(parent, rule) {
  const childRegExp = new RegExp(`(, )?(${parent.selector} [^,\s]*),?.*`); // eslint-disable-line no-useless-escape
  return rule.selector !== parent.selector && rule.selector.match(childRegExp) !== null;
}