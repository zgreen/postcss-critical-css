'use strict';

var chalk = require('chalk');
var postcss = require('postcss');
var cssnano = require('cssnano');
var fs = require('fs');
var path = require('path');

/**
 * Throw a warning if a critical selector is used more than once.
 *
 * @param {array} Array of critical CSS rules.
 * @param {selector} Selector to check for.
 * @return {string} Console warning.
 */
function selectorReuseWarning(rules, selector) {
  return rules.reduce(function (init, rule) {
    if (rule.selector === selector) {
      console.warn('Warning: Selector ' + selector + ' is used more than once.');
    }
    return rules;
  }, []);
}

/**
 * Identify critical CSS selectors
 *
 * @param {obj} PostCSS CSS object.
 * @return {object} Object containing critical rules, organized by output destination
 */
function getCriticalRules(css, preserve) {
  var critical = {};

  css.walkDecls('critical-selector', function (decl) {
    var dest = getDest(decl.parent);

    if ('undefined' === typeof critical[dest]) {
      critical[dest] = [];
    }

    switch (decl.value) {
      case 'scope':
        var childRules = getChildRules(css, decl.parent, preserve);

        selectorReuseWarning(critical[dest], decl.parent.selector);

        // Make sure the parent selector contains declarations
        if (decl.parent.nodes.length > 1) {
          critical[dest].push(decl.parent);
        }

        // Push all child rules
        if (childRules !== null && childRules.length) {
          childRules.forEach(function (rule) {
            critical[dest].push(rule);
          });
        }
        break;

      case 'this':
        selectorReuseWarning(critical[dest], decl.parent.selector);
        critical[dest].push(decl.parent);
        break;

      default:
        var container = decl.parent;

        container.selector = decl.value.replace(/['"]*/g, '');
        selectorReuseWarning(critical[dest], container.selector);
        critical[dest].push(container);
        break;
    }

    decl.remove();
  });

  return critical;
}

/**
 * Get rules for selectors nested within parent node
 *
 * @param {obj} PostCSS CSS object
 * @param {object} Parent rule for which children should be included
 * @param {bool} Whether or not to keep the critical rule in the stylesheet
 */
function getChildRules(css, parent, preserve) {
  var ruleList = [];
  var selectorRegExp = new RegExp(parent.selector);

  // Walk all rules to mach child selectors
  css.walkRules(selectorRegExp, function (rule) {
    var childRule = matchChild(parent, rule);

    if (childRule) {
      ruleList.push(rule);
    }
  });

  // Walk all at-rules to match nested child selectors
  css.walkAtRules(function (atRule) {
    atRule.walkRules(selectorRegExp, function (rule) {
      var childRule = matchChild(parent, rule);

      // Create new at-rule to append only necessary selector to critical
      var criticalAtRule = postcss.atRule({
        name: atRule.name,
        params: atRule.params
      });

      // Should append even if parent selector
      if (rule.selector === parent.selector || childRule) {
        criticalAtRule.append(rule);
        ruleList.push(criticalAtRule);

        if (!preserve) {
          rule.remove();
        }
      }
    });
  });

  return ruleList;
}

/**
 * Get rules for selectors nested within parent node
 *
 * @param {obj} PostCSS CSS object
 * @return {object} Parent rule for which children should be included
 */
function matchChild(parent, rule) {
  var childRegExp = new RegExp('(, )?(' + parent.selector + ' [^,\s]*),?.*');
  var childMatch = rule.selector.match(childRegExp);

  if (rule.selector !== parent.selector && childMatch !== null) {
    return true;
  }

  return false;
}

/**
 * Identify critical CSS destinations.
 *
 * @param {object} PostCSS rule.
 * @return {array} string corresponding to output destination.
 */
function getDest(selector) {
  var dest = 'critical.css';

  selector.walkDecls('critical-filename', function (decl) {
    dest = decl.value.replace(/['"]*/g, '');
    decl.remove();
  });

  return dest;
}

/**
 * Primary plugin function.
 *
 * @param {object} array of options.
 * @return {function} function for PostCSS plugin.
 */
function buildCritical(options) {
  var args = Object.assign({}, {
    outputPath: process.cwd(),
    preserve: true,
    minify: true,
    dryRun: false
  }, options);
  return function (css, result) {
    var criticalOutput = getCriticalRules(css, args.preserve);

    var _loop = function _loop(fileName) {
      var criticalCSS = postcss.parse('');
      var critical = '';
      var rules = [];
      var plugins = args.minify ? [cssnano()] : [];

      rules = criticalOutput[fileName].reduce(function (init, rule) {
        rule.walkDecls('critical', function (decl) {
          decl.remove();
        });
        criticalCSS.append(rule);

        if (rule.type === 'rule' && !args.preserve) {
          rule.remove();
        }

        return criticalOutput[fileName];
      }, {});

      postcss(plugins).process(criticalCSS).then(function (result) {
        if (!args.dryRun) {
          fs.writeFileSync(path.join(args.outputPath, fileName), result);
        } else {
          console.log(chalk.green('\nCritical CSS result is:\n' + chalk.yellow(result.css)));
          return '\nCritical CSS result is:\n' + result.css;
        }
      });
    };

    for (var fileName in criticalOutput) {
      _loop(fileName);
    }
  };
}

module.exports = postcss.plugin('postcss-critical', buildCritical);
