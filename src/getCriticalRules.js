// @flow

import postcss from 'postcss'
import { getChildRules } from './getChildRules'
import { getCriticalFromAtRule } from './atRule'
import { getCriticalDestination } from './getCriticalDestination'

// function getFirstAvailableLineNumber (rule: Object) {
//   return rule.nodes.reduce((acc, r) => {
//     return acc.source ? acc.source.start.line : acc[0].nodes
//   })
// }

function appendCritical (root, update) {
  update.clone().each(rule => {
    let result = rule.root()

    root.append(
      Object.keys(result).reduce((acc, key) => {
        if (key === 'nodes') {
          acc.nodes = result.nodes.filter(
            node => node.prop !== 'critical-selector'
          )
        } else {
          acc[key] = result[key]
        }
        return acc
      }, {})
    )
  })
  return root
}

/**
 * Identify critical CSS selectors
 *
 * @param {object} PostCSS CSS object.
 * @param {boolean} Whether or not to remove selectors from primary CSS document.
 * @param {string} Default output CSS file name.
 * @return {object} Object containing critical rules, organized by output destination
 */
export function getCriticalRules (
  css: Object,
  shouldPreserve: boolean,
  defaultDest: string
) {
  const critical: Object = getCriticalFromAtRule({ css })
  css.walkDecls('critical-selector', (decl: Object) => {
    const { parent, value } = decl
    const dest = getCriticalDestination(parent, defaultDest)
    const container = parent.parent.type === 'atrule' &&
      parent.parent.name === 'media'
      ? appendCritical(
          postcss.root().append({
            name: 'media',
            type: 'atrule',
            params: parent.parent.params
          }).nodes[0],
          parent
        )
      : parent
    const childRules = value === 'scope'
      ? getChildRules(css, parent, shouldPreserve)
      : []
    critical[dest] = typeof critical[dest] === 'undefined'
      ? postcss.root()
      : critical[dest]

    switch (value) {
      case 'scope':
        // Make sure the parent selector contains declarations
        if (parent.nodes.length > 1) {
          critical[dest].append(container.clone())
        }

        // Add all child rules
        if (childRules !== null && childRules.length) {
          critical[dest] = childRules.reduce((acc, rule) => {
            return acc.append(rule.clone())
          }, postcss.root())
        }
        // Ensure source ordering is correct.
        // critical[dest] = critical[dest].sort((a: Object, b: Object) => {
        //   const first = getFirstAvailableLineNumber(a)
        //   const second = getFirstAvailableLineNumber(b)
        //   return first - second
        // })
        break

      case 'this':
        appendCritical(critical[dest], container)
        // critical[dest].append(container.clone())
        break

      default:
        container.selector = value.replace(/['"]*/g, '')
        critical[dest].append(container.clone())
        break
    }

    decl.remove()
  })
  return new Promise(resolve => resolve(critical))
}
