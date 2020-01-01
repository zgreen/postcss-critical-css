// @flow

import chalk from "chalk";
import * as postcss from "postcss";
import cssnano from "cssnano";
import fs from "fs-extra";
import * as path from "path";
import { getCriticalRules } from "./getCriticalRules";

/**
 * Append to an existing critical CSS file?
 */
let append = false;

/**
 * Clean the original root node passed to the plugin, removing custom atrules,
 * properties. Will additionally delete nodes as appropriate if
 * `preserve === false`.
 *
 * @param {Object} root The root PostCSS object.
 * @param {boolean} preserve Preserve identified critical CSS in the root?
 */
function clean(root: postcss.Root, preserve: boolean) {
  root.walkAtRules("critical", (atRule: postcss.AtRule) => {
    if (preserve === false) {
      if (atRule.nodes && atRule.nodes.length) {
        atRule.remove();
      } else {
        root.removeAll();
      }
    } else {
      if (atRule.nodes && atRule.nodes.length) {
        atRule.replaceWith(atRule.nodes);
      } else {
        atRule.remove();
      }
    }
  });
  root.walkDecls(
    /critical-(selector|filename)/,
    (decl: postcss.Declaration) => {
      if (!preserve) {
        decl.remove();
        return;
      }
      if (decl && decl.parent) {
        const { parent } = decl;
        parent.remove();
        // If the wrapper has no valid child nodes, remove it entirely.
        if (parent.parent && hasNoOtherChildNodes(parent.parent, decl)) {
          parent.parent.remove();
        }
      }
    }
  );
}

/**
 * Do a dry run, console.log the output.
 *
 * @param {string} css CSS to output.
 */
function doDryRun(css: string) {
  console.log(
    // eslint-disable-line no-console
    chalk.green(`Critical CSS result is: ${chalk.yellow(css)}`)
  );
}

/**
 * Do a dry run, or write a file.
 *
 * @param {bool} dryRun Do a dry run?
 * @param {string} filePath Path to write file to.
 * @param {Object} result PostCSS root object.
 * @return {Promise} Resolves with writeCriticalFile or doDryRun function call.
 */
function dryRunOrWriteFile(
  dryRun: boolean,
  filePath: string,
  result: postcss.Result
): Promise<any> {
  const { css } = result;
  return new Promise((resolve: Function): void =>
    resolve(dryRun ? doDryRun(css) : writeCriticalFile(filePath, css))
  );
}

/**
 * Confirm a node has no child nodes other than a specific node.
 *
 * @param {array} nodes Nodes array to check.
 * @param {Object} node Node to check.
 * @return {boolean} Whether or not the node has no other children.
 */
function hasNoOtherChildNodes(
  nodes: postcss.Container,
  node: Object = postcss.root()
): boolean | void {
  return nodes.each((n: postcss.Node): boolean => {
    if (n !== node) {
      return false;
    }
    return true;
  });
}

/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
function writeCriticalFile(filePath: string, css: string) {
  fs.outputFile(filePath, css, { flag: append ? "a" : "w" }, err => {
    append = true;
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}

/**
 * Primary plugin function.
 *
 * @param {object} options Object of function args.
 * @return {function} function for PostCSS plugin.
 */
function buildCritical(options: Object = {}) {
  const filteredOptions = Object.keys(options).reduce(
    (acc: Object, key: string): Object =>
      typeof options[key] !== "undefined"
        ? { ...acc, [key]: options[key] }
        : acc,
    {}
  );
  const args = {
    outputPath: process.cwd(),
    outputDest: "critical.css",
    preserve: true,
    minify: true,
    dryRun: false,
    ...filteredOptions
  };
  append = false;
  return (css: Object): Object => {
    const { dryRun, preserve, minify, outputPath, outputDest } = args;
    const criticalOutput = getCriticalRules(css, outputDest);
    return Object.keys(criticalOutput).reduce((_, cur: string): Promise<
      Function
    > => {
      const criticalCSS = postcss.root();
      const filePath = path.join(outputPath, cur);
      criticalOutput[cur].each((rule: postcss.Rule) =>
        criticalCSS.append(rule.clone())
      );
      return (
        postcss(minify ? [cssnano] : [])
          // @TODO Use from/to correctly.
          .process(criticalCSS, {
            from: undefined
          })
          .then(dryRunOrWriteFile.bind(null, dryRun, filePath))
          .then(clean.bind(null, css, preserve))
      );
    }, {});
  };
}

module.exports = postcss.plugin("postcss-critical", buildCritical);
