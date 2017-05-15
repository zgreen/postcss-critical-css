// @flow

import postcss from 'postcss'
import { getChildRules } from './getChildRules'
import { getCriticalFromAtRule } from './atRule'
import { getCriticalDestination } from './getCriticalDestination'

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
        criticalRoot.walkRules((rule, idx) => {
          let start = rule.source.start.line
          if (rule.parent.type === 'atrule') {
            // console.log(JSON.stringify(rule.source, null, 2))
            // start = rule.parent.nodes[0].start.line
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
          // console.log(
          //   postcss.parse(rule).toString(),
          //   '\n',
          //   start,
          //   `\nIndex: ${idx}`,
          //   JSON.stringify(sortedRoot.last, null, 2)
          // )
          if (
            // idx === 0 ||
            sortedRoot.nodes.length === 0 ||
            (sortedRoot.last && sortedRoot.last.source.start.line > start)
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
