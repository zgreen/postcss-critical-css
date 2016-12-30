// @flow

import chalk from 'chalk'
import postcss from 'postcss'
import cssnano from 'cssnano'
import fs from 'fs'
import path from 'path'
import { getCriticalRules } from './getCriticalRules'

const broken =

/**
 * Primary plugin function.
 *
 * @param {object} array of options.
 * @return {function} function for PostCSS plugin.
 */
type ArgsType = {
  outputPath: string,
  preserve: boolean,
  minify: boolean,
  dryRun: boolean
}

function buildCritical (options: ArgsType): Function {
  const args = {
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false,
    ...options
  }
  return (css: Object): Object => {
    let criticalOutput = getCriticalRules(css, args.preserve, args.outputDest)
    return Object.keys(criticalOutput).reduce((init: Object, cur: string): Object => {
      const criticalCSS = postcss.root()
      criticalCSS.append(criticalOutput[cur])
      postcss(args.minify ? [cssnano()] : [])
        .process(criticalCSS)
        .then((result: Object) => {
          if (!args.dryRun) {
            fs.writeFile(
              path.join(args.outputPath, cur),
              result.css,
              (err) => {
                if (err) {
                  throw new Error(err)
                }
              }
            )
          } else {
            console.log( // eslint-disable-line no-console
              chalk.green(`
Critical CSS result is:
${chalk.yellow(result.css)}`)
            )
          }
        })
      return criticalOutput
    }, {})
  }
}

module.exports = postcss.plugin('postcss-critical', buildCritical)
