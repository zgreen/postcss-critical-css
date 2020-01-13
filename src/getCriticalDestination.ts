import * as postcss from "postcss";

export function getCriticalDestination(
  rule: postcss.Rule,
  dest: string
): string {
  rule.walkDecls("critical-filename", (decl: postcss.Declaration) => {
    dest = decl.value.replace(/['"]*/g, "");
    decl.remove();
  });
  return dest;
}
