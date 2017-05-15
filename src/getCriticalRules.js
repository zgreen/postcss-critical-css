// @flow

import postcss from 'postcss'
import { getChildRules } from './getChildRules'
import { getCriticalFromAtRule } from './atRule'
import { getCriticalDestination } from './getCriticalDestination'

/**
 * Update a critical root.
 *
 * @param {Object} root Root object to update.
 * @param {Object} update Update object.
 * @return {Object} root
 */
function updateCritical (root: Object, update: Object): Object {
  update.clone().each((rule: Object) => {
    const ruleRoot = rule.root()
    root.append(
      Object.keys(ruleRoot).reduce((acc: Object, key: string): Object => {
        if (key === 'nodes') {
          acc.nodes = ruleRoot.nodes.filter(
            (node: Object): boolean => node.prop !== 'critical-selector'
          )
        } else {
          acc[key] = ruleRoot[key]
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
): Object {
  const critical: Object = getCriticalFromAtRule({ css })
  css.walkDecls('critical-selector', (decl: Object) => {
    const { parent, value } = decl
    const dest = getCriticalDestination(parent, defaultDest)
    const container = parent.parent.type === 'atrule' &&
      parent.parent.name === 'media'
      ? updateCritical(
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
          criticalRoot = childRules.reduce(
            (acc: Object, rule: Object): Object => {
              return acc.append(rule.clone())
            },
            criticalRoot
          )
        }

        // Ensure source ordering is correct.
        criticalRoot.walkRules((rule: Object) => {
          let start = rule.source.start.line
          if (rule.parent.type === 'atrule') {
            const child = rule
            rule = postcss
              .atRule({
                name: rule.parent.name,
                params: rule.parent.params
              })
              .append(rule.clone())
            rule.source = child.source
            start = child.source.start.line
          }
          if (
            sortedRoot.nodes.length === 0 ||
            (sortedRoot.last && sortedRoot.last.source.start.line > start)
          ) {
            sortedRoot
              .prepend(rule)
              .walkDecls(
                'critical-selector',
                (criticalSelector: Object): void => criticalSelector.remove()
              )
          } else {
            sortedRoot
              .append(rule)
              .walkDecls(
                'critical-selector',
                (criticalSelector: Object): void => criticalSelector.remove()
              )
          }
        })
        critical[dest] = sortedRoot
        break

      case 'this':
        updateCritical(critical[dest], container)
        break

      default:
        critical[dest].append(container.clone())
        break
    }

    decl.remove()
  })
  return critical
}
