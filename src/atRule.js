// @flow

/**
 * Get critical CSS from an @ rule.
 *
 * @param {Object} args Function args. See flow type alias.
 */
type ArgsType = {filename: string, css: Object}
export function getCriticalFromAtRule (args: ArgsType): Object {
  let result: Object = {}
  const options = Object.assign({}, {
    filename: 'critical.css',
    css: {}
  }, args)
  options.css.walkAtRules('critical', () => {
    result = options.css
  })
  return result
}
