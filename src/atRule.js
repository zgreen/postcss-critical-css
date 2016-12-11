// @flow

/**
 * Get critical CSS from an @ rule.
 *
 * @param {Object} args Function args. See flow type alias.
 */
type ArgsType = {filename?: string, css?: Object}
export function getCriticalFromAtRule (args: ArgsType): Object {
  const result: Object = {}
  const options = {
    filename: 'critical.css',
    css: {},
    ...args
  }
  options.css.walkAtRules('critical', (rule: Object) => {
    result[rule.params ? rule.params : options.filename] = rule.nodes
      ? rule.nodes
      : rule.parent
    rule.remove()
  })
  return result
}
