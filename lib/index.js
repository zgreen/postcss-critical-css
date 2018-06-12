'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Do a dry run, console.log the output.
 *
 * @param {string} css CSS to output.
 */
let doDryRun = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (css) {
    console.log(
    // eslint-disable-line no-console
    (0, _chalk.green)(`Critical CSS result is: ${(0, _chalk.yellow)(css)}`));
  });

  return function doDryRun(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Do a dry run, or write a file.
 *
 * @param {bool} dryRun Do a dry run?
 * @param {string} filePath Path to write file to.
 * @param {Object} result PostCSS root object.
 * @return {Promise} Resolves with writeCriticalFile or doDryRun function call.
 */


let dryRunOrWriteFile = (() => {
  var _ref2 = (0, _asyncToGenerator3.default)(function* (dryRun, filePath, result) {
    const css = result.css;

    if (dryRun) {
      yield doDryRun(css);
    } else {
      yield writeCriticalFile(filePath, css);
    }
  });

  return function dryRunOrWriteFile(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Confirm a node has no child nodes other than a specific node.
 *
 * @param {array} nodes Nodes array to check.
 * @param {Object} node Node to check.
 * @return {boolean} Whether or not the node has no other children.
 */


/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
let writeCriticalFile = (() => {
  var _ref3 = (0, _asyncToGenerator3.default)(function* (filePath, css) {
    yield _fsExtra2.default.outputFile(filePath, css, { flag: append ? 'a' : 'w' }, function (err) {
      append = true;
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });

  return function writeCriticalFile(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Primary plugin function.
 *
 * @param {object} options Object of function args.
 * @return {function} function for PostCSS plugin.
 */


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

/**
 * Append to an existing critical CSS file?
 */
let append = false;

/**
 * Clean the original root node passed to the plugin, removing custom atrules,
 * properties. Will additionally delete nodes as appropriate if
 * `preserve === false`.
 *
 * @param {Object} root The root PostCSS object.
 * @param {boolean} preserve Preserve identified critical CSS in the root?
 */
function clean(root, preserve) {
  root.walkAtRules('critical', atRule => {
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
  root.walkDecls(/critical-(selector|filename)/, decl => {
    if (preserve === false) {
      if (decl.value === 'scope') {
        root.walk(node => {
          if (node.selector && node.selector.indexOf(decl.parent.selector) === 0) {
            if (node.parent && hasNoOtherChildNodes(node.parent.nodes, node)) {
              node.parent.remove();
            } else {
              node.remove();
            }
          }
        });
      }
      let wrapper = {};
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
}function hasNoOtherChildNodes(nodes = [], node = _postcss2.default.root()) {
  return nodes.filter(child => child !== node).length === 0;
}function buildCritical(options = {}) {
  const filteredOptions = Object.keys(options).reduce((acc, key) => typeof options[key] !== 'undefined' ? (0, _extends3.default)({}, acc, { [key]: options[key] }) : acc, {});
  const args = (0, _extends3.default)({
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false
  }, filteredOptions);
  append = false;
  return css => {
    const dryRun = args.dryRun,
          preserve = args.preserve,
          minify = args.minify,
          outputPath = args.outputPath,
          outputDest = args.outputDest;

    const criticalOutput = (0, _getCriticalRules.getCriticalRules)(css, outputDest);
    return Object.keys(criticalOutput).reduce((init, cur) => {
      const criticalCSS = _postcss2.default.root();
      const filePath = _path2.default.join(outputPath, cur);
      criticalOutput[cur].each(rule => criticalCSS.append(rule.clone()));
      return (0, _postcss2.default)(minify ? [_cssnano2.default] : []).process(criticalCSS, { from: undefined }).then((() => {
        var _ref4 = (0, _asyncToGenerator3.default)(function* (result) {
          yield dryRunOrWriteFile(dryRun, filePath, result);
          clean(css, preserve);
        });

        return function (_x7) {
          return _ref4.apply(this, arguments);
        };
      })());
    }, {});
  };
}

module.exports = _postcss2.default.plugin('postcss-critical', buildCritical);