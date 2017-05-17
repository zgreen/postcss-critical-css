// @flow

/**
 * Identify critical CSS destinations.
 *
 * @param {object} rule PostCSS rule.
 * @param {string} Default output CSS file name.
 * @return {string} String corresponding to output destination.
 */
export function getCriticalDestination (rule: Object, dest: string): string {
  return rule.walkDecls('critical-filename', (decl: Object) =>
    decl.value.replace(/['"]*/g, '')
  )
}
