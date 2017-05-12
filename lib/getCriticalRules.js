'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCriticalRules = getCriticalRules;

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _getChildRules = require('./getChildRules');

var _atRule = require('./atRule');

var _getCriticalDestination = require('./getCriticalDestination');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// function getFirstAvailableLineNumber (rule: Object) {
//   return rule.nodes.reduce((acc, r) => {
//     return acc.source ? acc.source.start.line : acc[0].nodes
//   })
// }

function appendCritical(root, update) {
  update.clone().each(function (rule) {
    var result = rule.root();
    root.append(Object.keys(result).reduce(function (acc, key) {
      if (key === 'nodes') {
        acc.nodes = result.nodes.filter(function (node) {
          return node.prop !== 'critical-selector';
        });
      } else {
        acc[key] = result[key];
      }
      return acc;
    }, {}));
  });
  return root;
}

/**
 * Identify critical CSS selectors
 *
 * @param {object} PostCSS CSS object.
 * @param {boolean} Whether or not to remove selectors from primary CSS document.
 * @param {string} Default output CSS file name.
 * @return {object} Object containing critical rules, organized by output destination
 */
function getCriticalRules(css, shouldPreserve, defaultDest) {
  var critical = (0, _atRule.getCriticalFromAtRule)({ css: css });
  css.walkDecls('critical-selector', function (decl) {
    var parent = decl.parent,
        value = decl.value;

    var dest = (0, _getCriticalDestination.getCriticalDestination)(parent, defaultDest);
    var container = parent;
    var childRules = value === 'scope' ? (0, _getChildRules.getChildRules)(css, parent, shouldPreserve) : [];
    critical[dest] = typeof critical[dest] === 'undefined' ? _postcss2.default.root() : critical[dest];

    switch (value) {
      case 'scope':
        // Make sure the parent selector contains declarations
        if (parent.nodes.length > 1) {
          critical[dest].append(container.clone());
        }

        // Add all child rules
        if (childRules !== null && childRules.length) {
          critical[dest] = childRules.reduce(function (acc, rule) {
            return acc.append(rule.clone());
          }, _postcss2.default.root());
        }
        // Ensure source ordering is correct.
        // critical[dest] = critical[dest].sort((a: Object, b: Object) => {
        //   const first = getFirstAvailableLineNumber(a)
        //   const second = getFirstAvailableLineNumber(b)
        //   return first - second
        // })
        break;

      case 'this':
        appendCritical(critical[dest], container);
        // critical[dest].append(container.clone())
        break;

      default:
        container.selector = value.replace(/['"]*/g, '');
        critical[dest].append(container.clone());
        break;
    }

    decl.remove();
  });
  return new Promise(function (resolve) {
    return resolve(critical);
  });
}