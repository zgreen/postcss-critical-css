// @flow

import { green, yellow } from 'chalk'
import postcss from 'postcss'
import cssnano from 'cssnano'
import fs from 'fs-extra'
import path from 'path'
import { getCriticalRules } from './getCriticalRules'

/**
 * Append to an existing critical CSS file?
 */
let append = false

/**
 * Clean the original root node passed to the plugin, removing custom atrules,
 * properties. Will additionally delete nodes as appropriate if
 * `preserve === false`.
 *
 * @param {Object} root The root PostCSS object.
 * @param {boolean} preserve Preserve identified critical CSS in the root?
 */
function clean (root: Object, preserve: boolean) {
  root.walkAtRules('critical', (atRule: Object) => {
    if (preserve === false) {
      if (atRule.nodes && atRule.nodes.length) {
        atRule.remove()
      } else {
        root.removeAll()
      }
    } else {
      if (atRule.nodes && atRule.nodes.length) {
        atRule.replaceWith(atRule.nodes)
      } else {
        atRule.remove()
      }
    }
  })
  // @TODO `scope` Makes this kind of gnarly. This could be cleaned up a bit.
  root.walkDecls(/critical-(selector|filename)/, (decl: Object) => {
    if (preserve === false) {
      if (decl.value === 'scope') {
        root.walk((node: Object) => {
          if (
            node.selector &&
            node.selector.indexOf(decl.parent.selector) === 0
          ) {
            if (node.parent && hasNoOtherChildNodes(node.parent.nodes, node)) {
              node.parent.remove()
            } else {
              node.remove()
            }
          }
        })
      }
      let wrapper = {}
      if (decl && decl.parent) {
        wrapper = decl.parent.parent
        decl.parent.remove()
      }
      // If the wrapper has no valid child nodes, remove it entirely.
      if (wrapper && hasNoOtherChildNodes(wrapper.nodes, decl)) {
        wrapper.remove()
      }
    } else {
      decl.remove()
    }
  })
}

/**
 * Do a dry run, console.log the output.
 *
 * @param {string} css CSS to output.
 */
async function doDryRun (css: string) {
  console.log(
    // eslint-disable-line no-console
    green(`Critical CSS result is: ${yellow(css)}`)
  )
}

/**
 * Do a dry run, or write a file.
 *
 * @param {bool} dryRun Do a dry run?
 * @param {string} filePath Path to write file to.
 * @param {Object} result PostCSS root object.
 * @return {Promise} Resolves with writeCriticalFile or doDryRun function call.
 */
async function dryRunOrWriteFile (
  dryRun: boolean,
  filePath: string,
  result: Object
) {
  const { css } = result
  if (dryRun) {
    await doDryRun(css)
  } else {
    await writeCriticalFile(filePath, css)
  }
}

/**
 * Confirm a node has no child nodes other than a specific node.
 *
 * @param {array} nodes Nodes array to check.
 * @param {Object} node Node to check.
 * @return {boolean} Whether or not the node has no other children.
 */
function hasNoOtherChildNodes (
  nodes: Array<Object> = [],
  node: Object = postcss.root()
): boolean {
  return nodes.filter((child: Object): boolean => child !== node).length === 0
}

/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
async function writeCriticalFile (filePath: string, css: string) {
  await fs.outputFile(
    filePath,
    css,
    { flag: append ? 'a' : 'w' },
    (err: ?ErrnoError) => {
      append = true
      if (err) {
        console.error(err)
        process.exit(1)
      }
    }
  )
}

/**
 * Primary plugin function.
 *
 * @param {object} options Object of function args.
 * @return {function} function for PostCSS plugin.
 */
function buildCritical (options: Object = {}): Function {
  const filteredOptions = Object.keys(options).reduce(
    (acc: Object, key: string): Object =>
      typeof options[key] !== 'undefined'
        ? { ...acc, [key]: options[key] }
        : acc,
    {}
  )
  const args = {
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false,
    ...filteredOptions
  }
  append = false
  return (css: Object): Object => {
    const { dryRun, preserve, minify, outputPath, outputDest } = args
    const criticalOutput = getCriticalRules(css, outputDest)
    return Object.keys(criticalOutput).reduce(
      (init: Object, cur: string): Function => {
        const criticalCSS = postcss.root()
        const filePath = path.join(outputPath, cur)
        criticalOutput[cur].each((rule: Object): Function =>
          criticalCSS.append(rule.clone())
        )
        // Can't use async/await within a call to reduce effectively,
        // hence leaving in chained `.then` for postcss().process
        return postcss(minify ? [cssnano] : [])
          .process(criticalCSS, { from: undefined })
          .then(async (result: Object) => {
            await dryRunOrWriteFile(dryRun, filePath, result)
            clean(css, preserve)
          })
      },
      {}
    )
  }
}

module.exports = postcss.plugin('postcss-critical', buildCritical)
