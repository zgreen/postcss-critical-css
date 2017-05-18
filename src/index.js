// @flow

import { green, yellow } from 'chalk'
import postcss from 'postcss'
import cssnano from 'cssnano'
import fs from 'fs'
import path from 'path'
import { getCriticalRules } from './getCriticalRules'

/**
 * Clean the root.
 */
function clean (root, preserve) {
  root.walkAtRules('critical', (atRule, idx) => {
    if (preserve === false && !atRule.nodes) {
      root.removeAll()
    } else {
      atRule.remove()
    }
  })
  root.walkDecls(/critical-(selector|filename)/, decl => {
    if (preserve === false) {
      if (decl.value === 'scope') {
        root.walk(node => {
          if (
            node.selector &&
            node.selector.indexOf(decl.parent.selector) === 0
          ) {
            node.remove()
          }
        })
      }
      let wrapper = {}
      if (decl && decl.parent) {
        wrapper = decl.parent.parent
        decl.parent.remove()
      }
      // If the wrapper has no valid child nodes, remove it entirely.
      if (wrapper && wrapper.nodes.filter(node => node !== decl).length === 0) {
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
function doDryRun (css: string) {
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
 * @return {Function} Calls writeCriticalFile or doDryRun
 */
function dryRunOrWriteFile (dryRun: boolean, filePath: string, result: Object) {
  const { css } = result
  return new Promise(resolve =>
    resolve(dryRun ? doDryRun(css) : writeCriticalFile(filePath, css))
  )
}

/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
function writeCriticalFile (filePath: string, css: string) {
  fs.writeFile(filePath, css, (err: Object) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
}

/**
 * Primary plugin function.
 *
 * @param {object} array of options.
 * @return {function} function for PostCSS plugin.
 */
function buildCritical (options: Object): Function {
  const args = {
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false,
    ...options
  }
  return (css: Object): Object => {
    const { dryRun, preserve, minify, outputPath, outputDest } = args
    const criticalOutput = getCriticalRules(css, outputDest)
    return Object.keys(
      criticalOutput
    ).reduce((init: Object, cur: string): Function => {
      const criticalCSS = postcss.root()
      const filePath = path.join(outputPath, cur)
      criticalOutput[cur].each((rule: Object): Function =>
        criticalCSS.append(rule.clone())
      )
      return postcss(minify ? [cssnano] : [])
        .process(criticalCSS)
        .then(dryRunOrWriteFile.bind(null, dryRun, filePath))
        .then(clean.bind(null, css, preserve))
    }, {})
  }
}

module.exports = postcss.plugin('postcss-critical', buildCritical)
