import * as postcss from "postcss";
import { getChildRules } from "./getChildRules";
import { getCriticalFromAtRule } from "./atRule";
import { getCriticalDestination } from "./getCriticalDestination";

function clean(
  root: postcss.Root,
  test: string = "critical-selector"
): postcss.Root {
  const clone = root.clone();
  clone.walkDecls(test, (decl: postcss.Declaration) => {
    decl.remove();
  });
  return clone;
}

function correctSourceOrder(root: postcss.Root): Object {
  const sortedRoot = postcss.root();
  const clone = root.clone();
  clone.walkRules((rule: postcss.Rule) => {
    let start = rule.source.start.line;
    if (rule.parent.type === "atrule") {
      const child = rule;
      rule = postcss
        .atRule({
          name: rule.parent.name,
          params: rule.parent.params
        })
        .append(rule.clone());
      rule.source = child.source;
      start = child.source.start.line;
    }
    if (
      sortedRoot.nodes.length === 0 ||
      (sortedRoot.last && sortedRoot.last.source.start.line > start)
    ) {
      sortedRoot.prepend(rule);
    } else {
      sortedRoot.append(rule);
    }
  });
  return sortedRoot;
}

function establishContainer(node: postcss.Rule): postcss.AtRule | postcss.Root {
  return node.parent.type === "atrule" && node.parent.name !== "critical"
    ? postcss.atRule({
        name: node.parent.name,
        type: node.parent.type,
        params: node.parent.params,
        nodes: [node]
      })
    : node.clone();
}

function updateCritical(root: postcss.Root, update): Object {
  const clonedRoot = root.clone();
  if (update.type === "rule") {
    clonedRoot.append(clean(update.clone()));
  } else {
    update.clone().each((rule: postcss.Root) => {
      clonedRoot.append(clean(rule.root()));
    });
  }
  return clonedRoot;
}

export function getCriticalRules(
  css: postcss.Root,
  defaultDest: string
): Object {
  const critical: Object = getCriticalFromAtRule({ css, defaultDest });
  css.walkDecls("critical-selector", (decl: postcss.Declaration) => {
    const { parent, value } = decl;
    const dest = getCriticalDestination(parent, defaultDest);
    const container = establishContainer(parent);
    const childRules = value === "scope" ? getChildRules(css, parent) : [];
    // Sanity check, make sure we've got a root node
    critical[dest] = critical[dest] || postcss.root();

    switch (value) {
      case "scope":
        // Add all child rules
        const criticalRoot = childRules.reduce(
          (acc: postcss.Root, rule: postcss.Rule): postcss.Root => {
            return acc.append(rule.clone());
          },
          critical[dest].append(container)
        );

        critical[dest] = clean(correctSourceOrder(criticalRoot));
        break;

      default:
        critical[dest] = updateCritical(critical[dest], container);
        break;
    }
  });
  return critical;
}
