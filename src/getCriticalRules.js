// @flow

import { getChildRules } from './getChildRules';
import { getCriticalDestination } from './getCriticalDestination';

/**
 * Identify critical CSS selectors
 *
 * @param {obj} PostCSS CSS object.
 * @return {object} Object containing critical rules, organized by output destination
 */
export function getCriticalRules(css: Object, shouldPreserve: boolean): Object {
  const critical = {};

  css.walkDecls('critical-selector', (decl: Object) => {
    const dest = getCriticalDestination(decl.parent);
    const container = decl.parent;
    const childRules = decl.value === 'scope' ?
      getChildRules(css, decl.parent, shouldPreserve) :
      [];
    if (typeof critical[dest] === 'undefined') {
      critical[dest] = [];
    }

    switch (decl.value) {
      case 'scope':
        // Make sure the parent selector contains declarations
        if (decl.parent.nodes.length > 1) {
          critical[dest].push(decl.parent);
        }

        // Push all child rules
        if (childRules !== null && childRules.length) {
          childRules.forEach((rule: Object) => {
            critical[dest].push(rule);
          });
        }
        break;

      case 'this':
        critical[dest].push(decl.parent);
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
