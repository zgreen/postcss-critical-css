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
    var container = parent.parent.type === 'atrule' && parent.parent.name === 'media' ? appendCritical(_postcss2.default.root().append({
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
        // criticalRoot.walkAtRules(rule => {
        //   if (
        //     idx === 0 ||
        //     sortedRoot.nodes.length === 0 ||
        //     sortedRoot.last.source.line.start < rule.nodes[0].source.line.start
        //   ) {
        //     sortedRoot
        //       .prepend(rule)
        //   } else {
        //     sortedRoot
        //       .append(rule)
        //
        //   }
        // })
        // criticalRoot.walk(rule => {
        //   console.log(JSON.stringify(rule, null, 2))
        // })
        criticalRoot.walkRules(function (rule, idx) {
          var start = rule.source.start.line;
          if (rule.parent.type === 'atrule') {
            // console.log(JSON.stringify(rule.source, null, 2))
            // start = rule.parent.nodes[0].start.line
            var child = rule;
            rule = _postcss2.default.atRule({
              name: rule.parent.name,
              params: rule.parent.params
            }).append(rule.clone());
            rule.source = child.source;
            start = child.source.start.line;
          }
          // console.log(
          //   postcss.parse(rule).toString(),
          //   '\n',
          //   start,
          //   `\nIndex: ${idx}`,
          //   JSON.stringify(sortedRoot.last, null, 2)
          // )
          if (
          // idx === 0 ||
          sortedRoot.nodes.length === 0 || sortedRoot.last && sortedRoot.last.source.start.line > start) {
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