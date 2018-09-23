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
 * @return {array} Array of child rules.
 */
function getChildRules(css, parent) {
  const result = [];
  const selectorRegExp = new RegExp(parent.selector);

  // Walk all rules to mach child selectors
  css.walkRules(selectorRegExp, rule => {
    const childRule = (0, _matchChild.matchChild)(parent, rule);
    if (childRule) {
      result.push(rule);
    }
  });

  // Walk all at-rules to match nested child selectors
  css.walkAtRules(atRule => {
    atRule.walkRules(selectorRegExp, rule => {
      const childRule = (0, _matchChild.matchChild)(parent, rule);
      // Create new at-rule to append only necessary selector to critical
      const criticalAtRule = _postcss2.default.atRule({
        name: atRule.name,
        params: atRule.params
      });
      /**
       * Should append even if parent selector, but make sure the two rules
       * aren't identical.
       */
      if ((rule.selector === parent.selector || childRule) && _postcss2.default.parse(rule).toString() !== _postcss2.default.parse(parent).toString()) {
        const clone = rule.clone();
        criticalAtRule.append(clone);
        result.push(criticalAtRule);
      }
    });
  });

  return result;
}