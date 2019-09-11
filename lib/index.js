'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _chalk = require('chalk');

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _cssnano = require('cssnano');

var _cssnano2 = _interopRequireDefault(_cssnano);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _getCriticalRules = require('./getCriticalRules');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Append to an existing critical CSS file?
 */
var append = false;

/**
 * Clean the original root node passed to the plugin, removing custom atrules,
 * properties. Will additionally delete nodes as appropriate if
 * `preserve === false`.
 *
 * @param {Object} root The root PostCSS object.
 * @param {boolean} preserve Preserve identified critical CSS in the root?
 */
function clean(root, preserve) {
  root.walkAtRules('critical', function (atRule) {
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
  // @TODO `scope` Makes this kind of gnarly. This could be cleaned up a bit.
  root.walkDecls(/critical-(selector|filename)/, function (decl) {
    if (preserve === false) {
      if (decl.value === 'scope') {
        root.walk(function (node) {
          if (node.selector && node.selector.indexOf(decl.parent.selector) === 0) {
            if (node.parent && hasNoOtherChildNodes(node.parent.nodes, node)) {
              node.parent.remove();
            } else {
              node.remove();
            }
          }
        });
      }
      var wrapper = {};
      if (decl && decl.parent) {
        wrapper = decl.parent.parent;
        decl.parent.remove();
      }
      // If the wrapper has no valid child nodes, remove it entirely.
      if (wrapper && hasNoOtherChildNodes(wrapper.nodes, decl)) {
        wrapper.remove();
      }
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
 * @return {Promise} Resolves with writeCriticalFile or doDryRun function call.
 */
function dryRunOrWriteFile(dryRun, filePath, result) {
  var css = result.css;

  return new Promise(function (resolve) {
    return resolve(dryRun ? doDryRun(css) : writeCriticalFile(filePath, css));
  });
}

/**
 * Confirm a node has no child nodes other than a specific node.
 *
 * @param {array} nodes Nodes array to check.
 * @param {Object} node Node to check.
 * @return {boolean} Whether or not the node has no other children.
 */
function hasNoOtherChildNodes() {
  var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _postcss2.default.root();

  return nodes.filter(function (child) {
    return child !== node;
  }).length === 0;
}

/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
function writeCriticalFile(filePath, css) {
  _fsExtra2.default.outputFile(filePath, css, { flag: append ? 'a' : 'w' }, function (err) {
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
function buildCritical() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var filteredOptions = Object.keys(options).reduce(function (acc, key) {
    return typeof options[key] !== 'undefined' ? _extends({}, acc, _defineProperty({}, key, options[key])) : acc;
  }, {});
  var args = _extends({
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false
  }, filteredOptions);
  append = false;
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
      return (0, _postcss2.default)(minify ? [_cssnano2.default] : [])
      // @TODO Use from/to correctly.
      .process(criticalCSS, {
        from: undefined
      }).then(dryRunOrWriteFile.bind(null, dryRun, filePath)).then(clean.bind(null, css, preserve));
    }, {});
  };
}

module.exports = _postcss2.default.plugin('postcss-critical', buildCritical);