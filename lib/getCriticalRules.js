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

function clean(root) {
  var test = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'critical-selector';

  var clone = root.clone();
  clone.walkDecls(test, function (decl) {
    decl.remove();
  });
  return clone;
}

// function cleanCriticalObject (obj: Object = {}) {
//   const cleaned = Object.keys(obj).reduce((acc: Object, key: string) => {
//     acc[key] = clean(obj[key])
//     return acc
//   }, {})
//   return cleaned || {}
// }

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
    console.log(clean(ruleRoot));
    clonedRoot.append(clean(ruleRoot));
    // clonedRoot.append(
    //   Object.keys(ruleRoot).reduce((acc: Object, key: string): Object => {
    //     if (key === 'nodes') {
    //       acc.nodes = ruleRoot.nodes.filter(
    //         (node: Object): boolean => node.prop !== 'critical-selector'
    //       )
    //     } else {
    //       acc[key] = ruleRoot[key]
    //     }
    //     return acc
    //   }, {})
    // )
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
        var sortedRoot = _postcss2.default.root();
        var criticalRoot = critical[dest];
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
            sortedRoot.prepend(rule);
          } else {
            sortedRoot.append(rule);
          }
        });
        critical[dest] = clean(sortedRoot);
        break;

      default:
        critical[dest] = updateCritical(critical[dest], container);
        break;
    }
    decl.remove();
  });
  return critical;
}