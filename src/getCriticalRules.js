// @flow

import postcss from 'postcss'
import { getChildRules } from './getChildRules'
import { getCriticalFromAtRule } from './atRule'
import { getCriticalDestination } from './getCriticalDestination'

// function shouldPrepend (root, next) {
//   let result = true
//   if (root.last && next.source) {
//     result =
//       (root.last.type === 'atrule'
//         ? root.last.nodes[0].source.line.start
//         : root.last.source.line.start) < next.source.line.start
//   } else if (!next.source) {
//     result = false
//   }
//   return result
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
        let criticalRoot = critical[dest]
        const sortedRoot = postcss.root()
        criticalRoot.append(container.clone())

        // Add all child rules
        if (childRules !== null && childRules.length) {
          criticalRoot = childRules.reduce((acc, rule) => {
            return acc.append(rule.clone())
          }, criticalRoot)
        }

        // Ensure source ordering is correct.
        criticalRoot.walkRules((rule, idx) => {
          if (
            idx === 0 ||
            sortedRoot.nodes.length === 0 ||
            sortedRoot.last.source.line.start < rule.source.line.start
          ) {
            sortedRoot
              .prepend(rule)
              .walkDecls('critical-selector', criticalSelector =>
                criticalSelector.remove()
              )
          } else {
            sortedRoot
              .append(rule)
              .walkDecls('critical-selector', criticalSelector =>
                criticalSelector.remove()
              )
          }
        })
        critical[dest] = sortedRoot
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
