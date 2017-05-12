'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChildRules = getChildRules;

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _matchChild = require('./matchChild');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get rules for selectors nested within parent node
 *
 * @param {Object} PostCSS CSS object
 * @param {Object} Parent rule for which children should be included
 * @param {boolean} Whether or not to keep the critical rule in the stylesheet
 */
function getChildRules(css, parent, shouldPreserve) {
  var result = [];
  var selectorRegExp = new RegExp(parent.selector);

  // Walk all rules to mach child selectors
  css.walkRules(selectorRegExp, function (rule) {
    var childRule = (0, _matchChild.matchChild)(parent, rule);
    if (childRule) {
      result.push(rule);
    }
  });

  // Walk all at-rules to match nested child selectors
  css.walkAtRules(function (atRule) {
    atRule.walkRules(selectorRegExp, function (rule) {
      var childRule = (0, _matchChild.matchChild)(parent, rule);
      // Create new at-rule to append only necessary selector to critical
      var criticalAtRule = _postcss2.default.atRule({
        name: atRule.name,
        params: atRule.params
      });
      // Should append even if parent selector
      if (rule.selector === parent.selector || childRule) {
        var clone = rule.clone();
        criticalAtRule.append(clone);
        result.push(criticalAtRule);
        if (!shouldPreserve) {
          rule.remove();
        }
      }
    });
  });

  return result;
}