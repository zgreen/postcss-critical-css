'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getCriticalFromAtRule = getCriticalFromAtRule;
function getCriticalFromAtRule(args) {
  var result = {};
  var options = _extends({
    filename: 'critical.css',
    css: {}
  }, args);
  options.css.walkAtRules('critical', function (rule) {
    result[rule.params ? rule.params : options.filename] = rule.nodes ? rule.nodes : rule.parent;
    rule.remove();
  });
  return result;
}

/**
 * Get critical CSS from an @ rule.
 *
 * @param {Object} args Function args. See flow type alias.
 */