import * as postcss from "postcss";

interface PluginArgs {
  css?: postcss.Root;
  defaultDest: string;
  preserve: boolean;
}

export function getCriticalFromAtRule(args: PluginArgs): Object {
  const result: Object = {};
  const options = {
    defaultDest: "critical.css",
    css: postcss.root(),
    ...args
  };

  options.css.walkAtRules("critical", (atRule: postcss.AtRule) => {
    const name = atRule.params ? atRule.params : options.defaultDest;
    // If rule has no nodes, all the nodes of the parent will be critical.
    let rule: postcss.AtRule | postcss.Root = atRule;
    if (!atRule.nodes) {
      rule = atRule.root();
    }
    rule.clone().each((node: postcss.AtRule) => {
      if (node.name !== "critical") {
        result[name] = result[name]
          ? result[name].append(node)
          : postcss.root().append(node);
      }
    });
  });
  return result;
}
