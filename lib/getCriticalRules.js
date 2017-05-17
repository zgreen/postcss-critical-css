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
 * Clean a root node of a declaration.
 *
 * @param {Object} root PostCSS root node.
 * @param {string} test Declaration string. Default  `critical-selector`
 * @return {Object} clone Cloned, cleaned root node.
 */
function clean(root) {
  var test = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'critical-selector';

  var clone = root.clone();
  clone.walkDecls(test, function (decl) {
    decl.remove();
  });
  return clone;
}

/**
 * Correct the source order of nodes in a root.
 *
 * @param {Object} root PostCSS root node.
 * @return {Object} sortedRoot Root with nodes sorted by source order.
 */
function correctSourceOrder(root) {
  var sortedRoot = _postcss2.default.root();
  var clone = root.clone();
  clone.walkRules(function (rule) {
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
      sortedRoot.prepend(rule);
    } else {
      sortedRoot.append(rule);
    }
  });
  return sortedRoot;
}

/**
 * Establish the container of a given node. Useful when preserving media queries
 * or other atrules.
 *
 * @param {Object} node PostCSS node.
 * @return {Object} A new root node with an atrule at its base.
 */
function establishContainer(node) {
  return node.parent.type === 'atrule' && node.parent.name !== 'critical' ? updateCritical(_postcss2.default.atRule({
    name: node.parent.name,
    type: node.parent.type,
    params: node.parent.params
  }), node) : node.clone();
}

/**
 * Update a critical root.
 *
 * @param {Object} root Root object to update.
 * @param {Object} update Update object.
 * @return {Object} clonedRoot Root object.
 */
function updateCritical(root, update) {
  var clonedRoot = root.clone();
  update.clone().each(function (rule) {
    var ruleRoot = rule.root();
    clonedRoot.append(clean(ruleRoot));
  });
  return clonedRoot;
}

/**
 * Identify critical CSS selectors
 *
 * @param {object} PostCSS CSS object.
 * @param {boolean} Whether or not to remove selectors from primary CSS document.
 * @param {string} Default output CSS file name.
 * @return {object} Object containing critical rules, organized by output destination
 */
function getCriticalRules(css, defaultDest) {
  var critical = (0, _atRule.getCriticalFromAtRule)({ css: css });
  css.walkDecls('critical-selector', function (decl) {
    var parent = decl.parent,
        value = decl.value;

    var dest = (0, _getCriticalDestination.getCriticalDestination)(parent, defaultDest);
    var container = establishContainer(parent);
    var childRules = value === 'scope' ? (0, _getChildRules.getChildRules)(css, parent) : [];
    // Sanity check, make sure we've got a root node
    critical[dest] = critical[dest] || _postcss2.default.root();

    switch (value) {
      case 'scope':
        // Add all child rules
        var criticalRoot = childRules.reduce(function (acc, rule) {
          return acc.append(rule.clone());
        }, critical[dest].append(container));

        critical[dest] = clean(correctSourceOrder(criticalRoot));
        break;

      default:
        critical[dest] = updateCritical(critical[dest], container);
        break;
    }
  });
  return critical;
}