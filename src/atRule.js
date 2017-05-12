// @flow
import postcss from 'postcss'
/**
 * Get critical CSS from an at-rule.
 *
 * @param {Object} args Function args. See flow type alias.
 */
type ArgsType = {filename?: string, css?: Object}
type Options = {filename: string, css: Object}
export function getCriticalFromAtRule (args: ArgsType): Object {
  const result: Object = {}
  const options: Options = {
    filename: 'critical.css',
    css: postcss.root(),
    ...args
  }

  options.css.walkAtRules('critical', (atRule: Object) => {
    const name = atRule.params ? atRule.params : options.filename
    // If rule has no nodes, all the nodes of the parent will be critical.
    let rule = atRule
    if (!atRule.nodes) {
      rule = atRule.root()
      rule.walkAtRules('critical', criticalRule => criticalRule.remove())
    }
    rule.clone().each(node => {
      result[name] = result[name]
        ? result[name].append(node)
        : postcss.root().append(node)
    })
    atRule.remove()
  })
  return result
}
