'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _chalk = require('chalk');

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
 * Clean the root.
 */
function clean(root, preserve) {
  // console.log(root)
  root.walkAtRules('critical', function (atRule, idx) {
    // if (atRule.params === 'atRule.critical.actual.css') {
    //   console.log(atRule.remove())
    // }
    // console.log(postcss.parse(atRule).toString())
    // if (atRule.params === 'atRule.critical.actual.css') {
    //   console.log(atRule)
    // }
    if (preserve === 'false' && !atRule.nodes) {
      root.removeAll();
    } else {
      // atRule.append({ prop: 'color', value: 'HEYYYY' })
      atRule.remove();
    }
  });
  root.walkDecls(/critical-(selector|filename)/, function (decl) {
    if (preserve === 'false') {
      decl.parent.remove();
    } else {
      decl.remove();
    }
  });
}

/**
 * Do a dry run, console.log the output.
 *
 * @param {string} css CSS to output.
 */
function doDryRun(css) {
  console.log(
  // eslint-disable-line no-console
  (0, _chalk.green)('Critical CSS result is: ' + (0, _chalk.yellow)(css)));
}

/**
 * Do a dry run, or write a file.
 *
 * @param {bool} dryRun Do a dry run?
 * @param {string} filePath Path to write file to.
 * @param {Object} result PostCSS root object.
 * @return {Function} Calls writeCriticalFile or doDryRun
 */
function dryRunOrWriteFile(dryRun, filePath, result) {
  var css = result.css;

  return new Promise(function (resolve) {
    return resolve(dryRun ? doDryRun(css) : writeCriticalFile(filePath, css));
  });
}

/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
function writeCriticalFile(filePath, css) {
  _fs2.default.writeFile(filePath, css, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}

/**
 * Primary plugin function.
 *
 * @param {object} array of options.
 * @return {function} function for PostCSS plugin.
 */
function buildCritical(options) {
  var args = _extends({
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false
  }, options);
  return function (css) {
    var dryRun = args.dryRun,
        preserve = args.preserve,
        minify = args.minify,
        outputPath = args.outputPath,
        outputDest = args.outputDest;

    var criticalOutput = (0, _getCriticalRules.getCriticalRules)(css, outputDest);
    return Object.keys(criticalOutput).reduce(function (init, cur) {
      var criticalCSS = _postcss2.default.root();
      var filePath = _path2.default.join(outputPath, cur);
      criticalOutput[cur].each(function (rule) {
        return criticalCSS.append(rule.clone());
      });
      return (0, _postcss2.default)(minify ? [_cssnano2.default] : []).process(criticalCSS).then(dryRunOrWriteFile.bind(null, dryRun, filePath)).then(clean.bind(null, css, preserve));
    }, {});
  };
}

module.exports = _postcss2.default.plugin('postcss-critical', buildCritical);