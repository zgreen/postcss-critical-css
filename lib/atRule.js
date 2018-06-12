'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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
  var options = (0, _extends3.default)({
    defaultDest: 'critical.css',
    css: _postcss2.default.root()
  }, args);

  options.css.walkAtRules('critical', function (atRule) {
    var name = atRule.params ? atRule.params : options.defaultDest;
    // If rule has no nodes, all the nodes of the parent will be critical.
    var rule = atRule;
    if (!atRule.nodes) {
      rule = atRule.root();
    }
    rule.clone().each(function (node) {
      if (node.name !== 'critical') {
        result[name] = result[name] ? result[name].append(node) : _postcss2.default.root().append(node);
      }
    });
  });
  return result;
}