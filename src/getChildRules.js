// @flow

import postcss from 'postcss'
import { matchChild } from './matchChild'

/**
 * Get rules for selectors nested within parent node
 *
 * @param {Object} PostCSS CSS object
 * @param {Object} Parent rule for which children should be included
 * @return {array} Array of child rules.
 */
export function getChildRules (css: Object, parent: Object): Array<Object> {
  const result = []
  const selectorRegExp: Object = new RegExp(parent.selector)

  // Walk all rules to mach child selectors
  css.walkRules(selectorRegExp, (rule: Object) => {
    const childRule = matchChild(parent, rule)
    if (childRule) {
      result.push(rule)
    }
  })

  // Walk all at-rules to match nested child selectors
  css.walkAtRules((atRule: Object) => {
    atRule.walkRules(selectorRegExp, (rule: Object) => {
      const childRule = matchChild(parent, rule)
      // Create new at-rule to append only necessary selector to critical
      const criticalAtRule = postcss.atRule({
        name: atRule.name,
        params: atRule.params
      })
      // Should append even if parent selector
      if (rule.selector === parent.selector || childRule) {
        const clone = rule.clone()
        criticalAtRule.append(clone)
        result.push(criticalAtRule)
      }
    })
  })

  return result
}
