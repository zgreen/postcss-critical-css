'use strict';

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _cssnano = require('cssnano');

var _cssnano2 = _interopRequireDefault(_cssnano);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _getCriticalRules = require('./getCriticalRules');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Primary plugin function.
 *
 * @param {object} array of options.
 * @return {function} function for PostCSS plugin.
 */
function buildCritical(options) {
  var args = Object.assign({}, {
    outputPath: process.cwd(),
    preserve: true,
    minify: true,
    dryRun: false
  }, options);
  console.log(args);
  return function (css) {
    var criticalOutput = (0, _getCriticalRules.getCriticalRules)(css, args.preserve);
    criticalOutput = Object.keys(criticalOutput).reduce(function (init, cur) {
      var criticalCSS = _postcss2.default.root();

      Object.keys(criticalOutput[criticalOutput[cur].fileName]).forEach(function (key) {
        var rule = criticalOutput[criticalOutput[cur].fileName][key];
        rule.walkDecls('critical', function (decl) {
          decl.remove();
        });
        criticalCSS.append(rule);
        if (rule.type === 'rule' && !args.preserve) {
          rule.remove();
        }
      });

      (0, _postcss2.default)(args.minify ? [(0, _cssnano2.default)()] : []).process(criticalCSS).then(function (result) {
        if (!args.dryRun) {
          _fs2.default.writeFileSync(_path2.default.join(args.outputPath, criticalOutput[cur].fileName), result);
        } else {
          console.log( // eslint-disable-line no-console
          _chalk2.default.green('\nCritical CSS result is:\n' + _chalk2.default.yellow(result.css)));
        }
      });
      return criticalOutput;
    }, {});
  };
}
// import { getCriticalFromAtRule } from './atRule'
// import { getCriticalDestination } from './getCriticalDestination'


module.exports = _postcss2.default.plugin('postcss-critical', buildCritical);