// @flow

import chalk from 'chalk';
import postcss from 'postcss';
import cssnano from 'cssnano';
import fs from 'fs';
import path from 'path';
// import { getCriticalFromAtRule } from './atRule';
// import { getCriticalDestination } from './getCriticalDestination';
import { getCriticalRules } from './getCriticalRules';

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
};

function buildCritical(options: ArgsType): Function {
  const args = Object.assign({},
    {
      outputPath: process.cwd(),
      preserve: true,
      minify: true,
      dryRun: false,
    },
    options
  );
  return (css: Object) => {
    let criticalOutput = getCriticalRules(css, args.preserve);
    criticalOutput = Object.keys(criticalOutput).reduce((init: Object, cur: string): Object => {
      const criticalCSS = postcss.root();

      Object.keys(criticalOutput[criticalOutput[cur].fileName]).forEach((key: string) => {
        const rule = criticalOutput[criticalOutput[cur].fileName][key];
        rule.walkDecls('critical', (decl: Object) => {
          decl.remove();
        });
        criticalCSS.append(rule);
        if (rule.type === 'rule' && !args.preserve) {
          rule.remove();
        }
      });

      postcss(args.minify ? [cssnano()] : [])
        .process(criticalCSS)
        .then((result: Object) => {
          if (!args.dryRun) {
            fs.writeFileSync(
              path.join(args.outputPath, criticalOutput[cur].fileName),
              result
            );
          } else {
            console.log( // eslint-disable-line no-console
              chalk.green(`
Critical CSS result is:
${chalk.yellow(result.css)}`)
            );
          }
        });
      return criticalOutput;
    }, {});
  };
}

module.exports = postcss.plugin('postcss-critical', buildCritical);
