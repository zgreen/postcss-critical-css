'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getCriticalFromAtRule = getCriticalFromAtRule;

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get critical CSS from an at-rule.
 *
 * @param {Object} args Function args. See flow type alias.
 */
function getCriticalFromAtRule(args) {
  var result = {};
  var options = _extends({
    filename: 'critical.css',
    css: _postcss2.default.root()
  }, args);

  options.css.walkAtRules('critical', function (atRule) {
    var name = atRule.params ? atRule.params : options.filename;
    // If rule has no nodes, all the nodes of the parent will be critical.
    var rule = atRule.nodes ? atRule : atRule.root();
    rule.clone().each(function (node) {
      result[name] = result[name] ? result[name].append(node) : _postcss2.default.root().append(node);
    });
    atRule.remove();
  });
  return result;
}