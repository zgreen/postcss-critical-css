import * as postcss from "postcss";
import { matchChild } from "./matchChild";

export function getChildRules(
  css: postcss.Root,
  parent: postcss.Rule
): Array<Object> {
  const result = [];
  const selectorRegExp: Object = new RegExp(parent.selector);

  // Walk all rules to mach child selectors
  css.walkRules(selectorRegExp, (rule: postcss.Rule) => {
    const childRule = matchChild(parent, rule);
    if (childRule) {
      result.push(rule);
    }
  });

  // Walk all at-rules to match nested child selectors
  css.walkAtRules((atRule: postcss.AtRule) => {
    atRule.walkRules(selectorRegExp, (rule: postcss.Rule) => {
      const childRule = matchChild(parent, rule);
      // Create new at-rule to append only necessary selector to critical
      const criticalAtRule = postcss.atRule({
        name: atRule.name,
        params: atRule.params
      });
      /**
       * Should append even if parent selector, but make sure the two rules
       * aren't identical.
       */
      if (
        (rule.selector === parent.selector || childRule) &&
        postcss.parse(rule).toString() !== postcss.parse(parent).toString()
      ) {
        const clone = rule.clone();
        criticalAtRule.append(clone);
        result.push(criticalAtRule);
      }
    });
  });

  return result;
}
