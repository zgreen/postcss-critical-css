'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCriticalDestination = getCriticalDestination;


/**
 * Identify critical CSS destinations.
 *
 * @param {object} rule PostCSS rule.
 * @param {string} Default output CSS file name.
 * @return {string} String corresponding to output destination.
 */
function getCriticalDestination(rule, dest) {
  rule.walkDecls('critical-filename', decl => {
    dest = decl.value.replace(/['"]*/g, '');
    decl.remove();
  });
  return dest;
}