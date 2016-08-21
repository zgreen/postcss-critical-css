// @flow

/**
 * Get rules for selectors nested within parent node
 *
 * @param {obj} PostCSS CSS object
 * @return {object} Parent rule for which children should be included
 */
export function matchChild(parent: Object, rule: Object): boolean {
  const childRegExp = new RegExp(`(, )?(${parent.selector} [^,\s]*),?.*`);
  return rule.selector !== parent.selector &&
    rule.selector.match(childRegExp) !== null;
}
