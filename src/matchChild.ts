import * as postcss from "postcss";

export function matchChild(
  parent: { selector: string },
  rule: postcss.Rule
): boolean {
  const childRegExp = new RegExp(`(, )?(${parent.selector} [^,\s]*),?.*`);
  return (
    rule.selector !== parent.selector &&
    rule.selector.match(childRegExp) !== null
  );
}
