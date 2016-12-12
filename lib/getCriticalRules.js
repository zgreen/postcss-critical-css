'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCriticalRules = getCriticalRules;

var _getChildRules = require('./getChildRules');

var _atRule = require('./atRule');

var _getCriticalDestination = require('./getCriticalDestination');

/**
 * Identify critical CSS selectors
 *
 * @param {object} PostCSS CSS object.
 * @return {object} Object containing critical rules, organized by output destination
 */
function getCriticalRules(css, shouldPreserve) {
  var critical = (0, _atRule.getCriticalFromAtRule)({ css: css });
  css.walkDecls('critical-selector', function (decl) {
    var dest = (0, _getCriticalDestination.getCriticalDestination)(decl.parent);
    var container = decl.parent.parent.type === 'atrule' ? decl.parent.parent : decl.parent;
    var childRules = decl.value === 'scope' ? (0, _getChildRules.getChildRules)(css, decl.parent, shouldPreserve) : [];
    if (typeof critical[dest] === 'undefined') {
      critical[dest] = [];
    }

    switch (decl.value) {
      case 'scope':
        // Make sure the parent selector contains declarations
        if (decl.parent.nodes.length > 1) {
          critical[dest].push(container);
        }

        // Add all child rules
        if (childRules !== null && childRules.length) {
          critical[dest] = critical[dest].concat(childRules);
        }
        // Ensure source ordering is correct.
        critical[dest] = critical[dest].sort(function (a, b) {
          return a.source.start.line - b.source.start.line;
        });
        break;

      case 'this':
        critical[dest].push(container);
        break;

      default:
        container.selector = decl.value.replace(/['"]*/g, '');
        critical[dest].push(container);
        break;
    }

    decl.remove();
  });
  return critical;
}