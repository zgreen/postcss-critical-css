// @flow

import { getChildRules } from './getChildRules'
import { getCriticalFromAtRule } from './atRule'
import { getCriticalDestination } from './getCriticalDestination'

/**
 * Identify critical CSS selectors
 *
 * @param {object} PostCSS CSS object.
 * @param {boolean} Whether or not to remove selectors from primary CSS document.
 * @param {string} Default output CSS file name.
 * @return {object} Object containing critical rules, organized by output destination
 */
export function getCriticalRules (css: Object, shouldPreserve: boolean, defaultDest: string): Object {
  const critical = getCriticalFromAtRule({ css })
  css.walkDecls('critical-selector', (decl: Object) => {
    const dest = getCriticalDestination(decl.parent, defaultDest)
    const container = decl.parent.parent.type === 'atrule'
      ? decl.parent.parent
      : decl.parent
    const childRules = decl.value === 'scope'
      ? getChildRules(css, decl.parent, shouldPreserve)
      : []
    if (typeof critical[dest] === 'undefined') {
      critical[dest] = []
    }

    switch (decl.value) {
      case 'scope':
        // Make sure the parent selector contains declarations
        if (decl.parent.nodes.length > 1) {
          critical[dest].push(container)
        }

        // Add all child rules
        if (childRules !== null && childRules.length) {
          critical[dest] = critical[dest].concat(childRules)
        }
        // Ensure source ordering is correct.
        critical[dest] = critical[dest]
          .sort((a: Object, b: Object) => a.source.start.line - b.source.start.line)
        break

      case 'this':
        critical[dest].push(container)
        break

      default:
        container.selector = decl.value.replace(/['"]*/g, '')
        critical[dest].push(container)
        break
    }

    decl.remove()
  })
  return critical
}
