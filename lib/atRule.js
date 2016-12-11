'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCriticalFromAtRule = getCriticalFromAtRule;
function getCriticalFromAtRule(args) {
  var result = {};
  var options = Object.assign({}, {
    filename: 'critical.css',
    css: {}
  }, args);
  options.css.walkAtRules('critical', function () {
    result = options.css;
  });
  return result;
}

/**
 * Get critical CSS from an @ rule.
 *
 * @param {Object} args Function args. See flow type alias.
 */