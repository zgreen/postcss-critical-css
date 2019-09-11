import postcss from 'postcss'
import { matchChild } from './matchChild'

/**
 * Get rules for selectors nested within parent node
 *
 * @param {Object} PostCSS CSS object
 * @param {Object} Parent rule for which children should be included
 * @return {array} Array of child rules.
 */
export function getChildRules (css, parent) {
  const result = []
  const selectorRegExp = new RegExp(parent.selector)

  // Walk all rules to mach child selectors
  css.walkRules(selectorRegExp, (rule) => {
    const childRule = matchChild(parent, rule)
    if (childRule) {
      result.push(rule)
    }
  })

  // Walk all at-rules to match nested child selectors
  css.walkAtRules((atRule) => {
    atRule.walkRules(selectorRegExp, (rule) => {
      const childRule = matchChild(parent, rule)
      // Create new at-rule to append only necessary selector to critical
      const criticalAtRule = postcss.atRule({
        name: atRule.name,
        params: atRule.params
      })
      /**
       * Should append even if parent selector, but make sure the two rules
       * aren't identical.
       */
      if (
        (rule.selector === parent.selector || childRule) &&
        postcss.parse(rule).toString() !== postcss.parse(parent).toString()
      ) {
        const clone = rule.clone()
        criticalAtRule.append(clone)
        result.push(criticalAtRule)
      }
    })
  })

  return result
}
