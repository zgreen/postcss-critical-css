// @flow

import postcss from 'postcss'
import { getChildRules } from './getChildRules'
import { getCriticalFromAtRule } from './atRule'
import { getCriticalDestination } from './getCriticalDestination'

/**
 * Clean a root node of a declaration.
 *
 * @param {Object} root PostCSS root node.
 * @param {string} test Declaration string. Default  `critical-selector`
 * @return {Object} clone Cloned, cleaned root node.
 */
function clean (root: Object, test: string = 'critical-selector'): Object {
  const clone = root.clone()
  clone.walkDecls(test, (decl: Object) => {
    decl.remove()
  })
  return clone
}

/**
 * Correct the source order of nodes in a root.
 *
 * @param {Object} root PostCSS root node.
 * @return {Object} sortedRoot Root with nodes sorted by source order.
 */
function correctSourceOrder (root: Object): Object {
  const sortedRoot = postcss.root()
  const clone = root.clone()
  clone.walkRules((rule: Object) => {
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
      sortedRoot.prepend(rule)
    } else {
      sortedRoot.append(rule)
    }
  })
  return sortedRoot
}

/**
 * Establish the container of a given node. Useful when preserving media queries
 * or other atrules.
 *
 * @param {Object} node PostCSS node.
 * @return {Object} A new root node with an atrule at its base.
 */
function establishContainer (node: Object): Object {
  return node.parent.type === 'atrule' && node.parent.name !== 'critical'
    ? updateCritical(
        postcss.atRule({
          name: node.parent.name,
          type: node.parent.type,
          params: node.parent.params
        }),
        node
      )
    : node.clone()
}

/**
 * Update a critical root.
 *
 * @param {Object} root Root object to update.
 * @param {Object} update Update object.
 * @return {Object} clonedRoot Root object.
 */
function updateCritical (root: Object, update: Object): Object {
  const clonedRoot = root.clone()
  update.clone().each((rule: Object) => {
    const ruleRoot = rule.root()
    clonedRoot.append(clean(ruleRoot))
  })
  return clonedRoot
}

/**
 * Identify critical CSS selectors
 *
 * @param {object} PostCSS CSS object.
 * @param {boolean} Whether or not to remove selectors from primary CSS document.
 * @param {string} Default output CSS file name.
 * @return {object} Object containing critical rules, organized by output destination
 */
export function getCriticalRules (css: Object, defaultDest: string): Object {
  const critical: Object = getCriticalFromAtRule({ css, defaultDest })
  css.walkDecls('critical-selector', (decl: Object) => {
    const { parent, value } = decl
    const dest = getCriticalDestination(parent, defaultDest)
    const container = establishContainer(parent)
    const childRules = value === 'scope' ? getChildRules(css, parent) : []
    // Sanity check, make sure we've got a root node
    critical[dest] = critical[dest] || postcss.root()

    switch (value) {
      case 'scope':
        // Add all child rules
        const criticalRoot = childRules.reduce(
          (acc: Object, rule: Object): Object => {
            return acc.append(rule.clone())
          },
          critical[dest].append(container)
        )

        critical[dest] = clean(correctSourceOrder(criticalRoot))
        break

      default:
        critical[dest] = updateCritical(critical[dest], container)
        break
    }
  })
  return critical
}
