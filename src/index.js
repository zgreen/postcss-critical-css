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
function clean(root, preserve) {
  root.walkAtRules('critical', (atRule) => {
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
  root.walkDecls(/critical-(selector|filename)/, (decl) => {
    if (preserve === false) {
      if (decl.value === 'scope') {
        root.walk((node) => {
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
function doDryRun(css) {
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
function dryRunOrWriteFile(
  dryRun,
  filePath,
  result
) {
  const { css } = result
  return new Promise(
    (resolve) =>
      resolve(dryRun ? doDryRun(css) : writeCriticalFile(filePath, css))
  )
}

/**
 * Confirm a node has no child nodes other than a specific node.
 *
 * @param {array} nodes Nodes array to check.
 * @param {Object} node Node to check.
 * @return {boolean} Whether or not the node has no other children.
 */
function hasNoOtherChildNodes(
  nodes = [],
  node = postcss.root()
) {
  return nodes.filter((child) => child !== node).length === 0
}

/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
function writeCriticalFile(filePath, css) {
  fs.outputFile(
    filePath,
    css,
    { flag: append ? 'a' : 'w' },
    (err) => {
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
function buildCritical(options = {}) {
  const filteredOptions = Object.keys(options).reduce(
    (acc, key) =>
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
  return (css) => {
    const { dryRun, preserve, minify, outputPath, outputDest } = args
    const criticalOutput = getCriticalRules(css, outputDest)
    return Object.keys(criticalOutput).reduce(
      (init, cur) => {
        const criticalCSS = postcss.root()
        const filePath = path.join(outputPath, cur)
        criticalOutput[cur].each(
          (rule) => criticalCSS.append(rule.clone())
        )
        return (
          postcss(minify ? [cssnano] : [])
            // @TODO Use from/to correctly.
            .process(criticalCSS, {
              from: undefined
            })
            .then(dryRunOrWriteFile.bind(null, dryRun, filePath))
            .then(clean.bind(null, css, preserve))
        )
      },
      {}
    )
  }
}

module.exports = postcss.plugin('postcss-critical', buildCritical)
