'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
  var args = _extends({
    outputPath: process.cwd(),
    preserve: true,
    minify: true,
    dryRun: false
  }, options);
  return function (css) {
    var criticalOutput = (0, _getCriticalRules.getCriticalRules)(css, args.preserve);
    return Object.keys(criticalOutput).reduce(function (init, cur) {
      var criticalCSS = _postcss2.default.root();
      criticalCSS.append(criticalOutput[cur]);
      (0, _postcss2.default)(args.minify ? [(0, _cssnano2.default)()] : []).process(criticalCSS).then(function (result) {
        if (!args.dryRun) {
          _fs2.default.writeFile(_path2.default.join(args.outputPath, cur), result.css);
        } else {
          console.log( // eslint-disable-line no-console
          _chalk2.default.green('\nCritical CSS result is:\n' + _chalk2.default.yellow(result.css)));
        }
      });
      return criticalOutput;
    }, {});
  };
}

module.exports = _postcss2.default.plugin('postcss-critical', buildCritical);