// @flow

/**
 * Identify critical CSS destinations.
 *
 * @param {object} rule PostCSS rule.
 * @param {string} Default output CSS file name.
 * @return {string} String corresponding to output destination.
 */
export function getCriticalDestination(rule: Object, dest: string): string {
  rule.walkDecls("critical-filename", (decl: Object) => {
    dest = decl.value.replace(/['"]*/g, "");
    decl.remove();
  });
  return dest;
}
