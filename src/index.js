// @flow

import {red, green, yellow} from 'chalk'
import postcss from 'postcss'
import cssnano from 'cssnano'
import fs from 'fs'
import path from 'path'
import {getCriticalRules} from './getCriticalRules'

type CriticalBuildArgs = {
  outputPath: string,
  preserve: boolean,
  minify: boolean,
  dryRun: boolean
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
  const {css} = result
  return dryRun ? doDryRun(css) : writeCriticalFile(filePath, css)
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
function buildCritical (options: CriticalBuildArgs) {
  const args = {
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false,
    ...options
  }
  return (css: Object) => {
    const {dryRun, preserve, minify, outputPath, outputDest} = args
    getCriticalRules(css, preserve, outputDest)
      .catch(err => {
        console.error(`${red.bold('Error:')} ${err}`)
        process.exit(1)
      })
      .then(criticalOutput => {
        return Object.keys(
          criticalOutput
        ).reduce((init: Object, cur: string): Object => {
          const criticalCSS = postcss.root()
          const filePath = path.join(outputPath, cur)
          criticalOutput[cur].each(rule => {
            criticalCSS.append(rule.clone())
          })
          postcss(minify ? [cssnano] : [])
            .process(criticalCSS)
            .then(dryRunOrWriteFile.bind(null, dryRun, filePath))
          return criticalOutput
        }, {})
      })
  }
}

module.exports = postcss.plugin('postcss-critical', buildCritical)
