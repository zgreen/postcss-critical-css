'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCriticalDestination = getCriticalDestination;


/**
 * Identify critical CSS destinations.
 *
 * @param {object} rule PostCSS rule.
 * @return {string} String corresponding to output destination.
 */
function getCriticalDestination(rule) {
  var dest = 'critical.css';
  rule.walkDecls('critical-filename', function (decl) {
    dest = decl.value.replace(/['"]*/g, '');
    decl.remove();
  });
  return dest;
}