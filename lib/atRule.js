"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCriticalFromAtRule = getCriticalFromAtRule;

var _postcss = _interopRequireDefault(require("postcss"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Get critical CSS from an at-rule.
 *
 * @param {Object} args Function args. See flow type alias.
 */
function getCriticalFromAtRule(args) {
  const result = {};

  const options = _objectSpread({
    defaultDest: 'critical.css',
    css: _postcss.default.root()
  }, args);

  options.css.walkAtRules('critical', atRule => {
    const name = atRule.params ? atRule.params : options.defaultDest; // If rule has no nodes, all the nodes of the parent will be critical.

    let rule = atRule;

    if (!atRule.nodes) {
      rule = atRule.root();
    }

    rule.clone().each(node => {
      if (node.name !== 'critical') {
        result[name] = result[name] ? result[name].append(node) : _postcss.default.root().append(node);
      }
    });
  });
  return result;
}