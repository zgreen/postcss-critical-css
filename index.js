'use strict';

var postcss = require('postcss');
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
  return rules.reduce((init, rule) => {
    if (rule.selector === selector) {
      console.warn(`Warning: Selector ${selector} is used more than once.`);
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
function getCriticalRules(css) {
  let critical = {};

  css.walkDecls('critical-selector', decl => {
    let dest = getDest(decl.parent);

    if ('undefined' === typeof critical[dest]) {
      critical[dest] = [];
    }

    switch (decl.value) {
      case 'scope':
        let childRules = getChildRules(css, decl.parent);

        selectorReuseWarning(critical[dest], decl.parent.selector);
        critical[dest].push(decl.parent);

        if (childRules !== null && childRules.length) {
          childRules.forEach(rule => {
            critical[dest].push(rule);
          });
        }
        break;

      case 'this':
        selectorReuseWarning(critical[dest], decl.parent.selector);
        critical[dest].push(decl.parent);
        break;

      default:
        const container = decl.parent;

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
 * @return {object} Parent rule for which children should be included
 */
function getChildRules(css, parent) {
  let ruleList = [];
  let selectorRegExp = new RegExp('^' + parent.selector);
  let childRegExp = new RegExp('^' + parent.selector + ' .*');

  css.walkRules(selectorRegExp, rule => {
    let childMatch = null;

    if (rule.selector !== parent.selector) {
      childMatch = rule.selector.match(childRegExp);

      if (childMatch !== null) {
        ruleList.push(rule);
      }
    }
  });

  return ruleList;
}

/**
 * Identify critical CSS destinations.
 *
 * @param {object} PostCSS rule.
 * @return {array} string corresponding to output destination.
 */
function getDest(selector) {
  let dest = 'critical'

  selector.walkDecls('critical-dest', decl => {
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
  options = Object.assign({
    outputPath: process.cwd()
  }, options || {})

  return (css, result) => {
    let criticalOutput = getCriticalRules(css);

    for (let dest in criticalOutput) {
      let criticalCSS = postcss.parse('');
      let critical = '';
      let rules = [];
      let destfilename = dest == 'critical.css' ? dest : dest + '-critical.css';

      rules = criticalOutput[dest].reduce((init, rule) => {
        rule.walkDecls('critical', (decl) => {
          decl.remove();
        });
        criticalCSS.append(rule);
        return criticalOutput[dest];
      }, {});

      critical = postcss().process(criticalCSS).css;

      fs.writeFile(path.join(options.outputPath, destfilename), critical);
    }
  }
}

module.exports = postcss.plugin('postcss-critical', buildCritical);
