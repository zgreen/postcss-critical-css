"use strict";

var _chalk = require("chalk");

var _postcss = _interopRequireDefault(require("postcss"));

var _cssnano = _interopRequireDefault(require("cssnano"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getCriticalRules = require("./getCriticalRules");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
  }); // @TODO `scope` Makes this kind of gnarly. This could be cleaned up a bit.

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
      } // If the wrapper has no valid child nodes, remove it entirely.


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
  console.log( // eslint-disable-line no-console
  (0, _chalk.green)(`Critical CSS result is: ${(0, _chalk.yellow)(css)}`));
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
  const css = result.css;
  return new Promise(resolve => resolve(dryRun ? doDryRun(css) : writeCriticalFile(filePath, css)));
}
/**
 * Confirm a node has no child nodes other than a specific node.
 *
 * @param {array} nodes Nodes array to check.
 * @param {Object} node Node to check.
 * @return {boolean} Whether or not the node has no other children.
 */


function hasNoOtherChildNodes(nodes = [], node = _postcss.default.root()) {
  return nodes.filter(child => child !== node).length === 0;
}
/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */


function writeCriticalFile(filePath, css) {
  _fs.default.writeFile(filePath, css, {
    flag: append ? 'a' : 'w'
  }, err => {
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


function buildCritical(options = {}) {
  const filteredOptions = Object.keys(options).reduce((acc, key) => typeof options[key] !== 'undefined' ? _objectSpread({}, acc, {
    [key]: options[key]
  }) : acc, {});

  const args = _objectSpread({
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
      const criticalCSS = _postcss.default.root();

      const filePath = _path.default.join(outputPath, cur);

      criticalOutput[cur].each(rule => criticalCSS.append(rule.clone()));
      return (0, _postcss.default)(minify ? [_cssnano.default] : []) // @TODO Use from/to correctly.
      .process(criticalCSS, {
        from: undefined
      }).then(dryRunOrWriteFile.bind(null, dryRun, filePath)).then(clean.bind(null, css, preserve));
    }, {});
  };
}

module.exports = _postcss.default.plugin('postcss-critical', buildCritical);