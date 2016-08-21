// @flow

/**
 * Identify critical CSS destinations.
 *
 * @param {object} rule PostCSS rule.
 * @return {string} String corresponding to output destination.
 */
export function getCriticalDestination(rule: Object): string {
  let dest: string = 'critical.css';
  rule.walkDecls('critical-filename', (decl: Object) => {
    dest = decl.value.replace(/['"]*/g, '');
    decl.remove();
  });
  return dest;
}
