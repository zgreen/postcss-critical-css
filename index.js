'use strict';

var postcss = require('postcss');
var fs = require('fs');

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
 * Identify critical CSS rules.
 *
 * @param {obj} PostCSS CSS object.
 * @return {array} Array of critical CSS rules.
 */
function getCriticalRules(css) {
  let critical = [];
  css.walkDecls('critical', (decl) => {
    if (decl.value === 'this') {
      selectorReuseWarning(critical, decl.parent.selector);
      critical.push(decl.parent);
    } else {
      const container = decl.parent;
      container.selector = decl.value;
      selectorReuseWarning(critical, container.selector);
      critical.push(container);
    }
    decl.remove();
  });
  return critical;
}

module.exports = postcss.plugin('postcss-critical', () => {
  return (css, result) => {
    const criticalCSS = postcss.parse('');
    let rules = getCriticalRules(css);
    rules = rules.reduce((init, rule) => {
      rule.walkDecls('critical', (decl) => {
        decl.remove();
      });
      criticalCSS.append(rule);
      return rules;
    }, {});
    const critical = postcss().process(criticalCSS).css;
    fs.writeFile('critical.css', critical);
  }
});
