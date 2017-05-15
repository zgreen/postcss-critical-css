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

/**
 * Update a critical root.
 *
 * @param {Object} root Root object to update.
 * @param {Object} update Update object.
 * @return {Object} root
 */
function updateCritical(root, update) {
  update.clone().each(function (rule) {
    var ruleRoot = rule.root();
    root.append(Object.keys(ruleRoot).reduce(function (acc, key) {
      if (key === 'nodes') {
        acc.nodes = ruleRoot.nodes.filter(function (node) {
          return node.prop !== 'critical-selector';
        });
      } else {
        acc[key] = ruleRoot[key];
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
    var container = parent.parent.type === 'atrule' && parent.parent.name === 'media' ? updateCritical(_postcss2.default.root().append({
      name: 'media',
      type: 'atrule',
      params: parent.parent.params
    }).nodes[0], parent) : parent;
    var childRules = value === 'scope' ? (0, _getChildRules.getChildRules)(css, parent, shouldPreserve) : [];
    critical[dest] = typeof critical[dest] === 'undefined' ? _postcss2.default.root() : critical[dest];

    switch (value) {
      case 'scope':
        var criticalRoot = critical[dest];
        var sortedRoot = _postcss2.default.root();
        criticalRoot.append(container.clone());

        // Add all child rules
        if (childRules !== null && childRules.length) {
          criticalRoot = childRules.reduce(function (acc, rule) {
            return acc.append(rule.clone());
          }, criticalRoot);
        }

        // Ensure source ordering is correct.
        criticalRoot.walkRules(function (rule) {
          var start = rule.source.start.line;
          if (rule.parent.type === 'atrule') {
            var child = rule;
            rule = _postcss2.default.atRule({
              name: rule.parent.name,
              params: rule.parent.params
            }).append(rule.clone());
            rule.source = child.source;
            start = child.source.start.line;
          }
          if (sortedRoot.nodes.length === 0 || sortedRoot.last && sortedRoot.last.source.start.line > start) {
            sortedRoot.prepend(rule).walkDecls('critical-selector', function (criticalSelector) {
              return criticalSelector.remove();
            });
          } else {
            sortedRoot.append(rule).walkDecls('critical-selector', function (criticalSelector) {
              return criticalSelector.remove();
            });
          }
        });
        critical[dest] = sortedRoot;
        break;

      case 'this':
        updateCritical(critical[dest], container);
        break;

      default:
        container.selector = value.replace(/['"]*/g, '');
        critical[dest].append(container.clone());
        break;
    }

    decl.remove();
  });
  return critical;
  // return new Promise(resolve => resolve(critical))
}