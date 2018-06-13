'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Do a dry run, or write a file.
 *
 * @param {bool} dryRun Do a dry run?
 * @param {string} filePath Path to write file to.
 * @param {Object} result PostCSS root object.
 * @return {Promise} Resolves with writeCriticalFile or doDryRun function call.
 */
let dryRunOrWriteFile = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (dryRun, filePath, result) {
    const css = result.css;

    if (dryRun) {
      doDryRun(css);
    } else {
      yield limiter.schedule(writeCriticalFile, filePath, css);
    }
  });

  return function dryRunOrWriteFile(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
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
  var _ref2 = (0, _asyncToGenerator3.default)(function* (filePath, css) {
    console.log(`writeCriticalFile: ${filePath}`);
    try {
      yield _fsExtra2.default.outputFile(filePath, css, { flag: append ? 'a' : 'w' });
      append = true;
    } catch (err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    }
  });

  return function writeCriticalFile(_x4, _x5) {
    return _ref2.apply(this, arguments);
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

var _bottleneck = require('bottleneck');

var _bottleneck2 = _interopRequireDefault(_bottleneck);

var _getCriticalRules = require('./getCriticalRules');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Append to an existing critical CSS file?
 */
let append = false;

/**
 * Rate limiter for file writes
 */


const limiter = new _bottleneck2.default({
  maxConcurrent: 1,
  minTime: 250
});

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
}

/**
 * Do a dry run, console.log the output.
 *
 * @param {string} css CSS to output.
 */
function doDryRun(css) {
  console.log(
  // eslint-disable-line no-console
  (0, _chalk.green)(`Critical CSS result is: ${(0, _chalk.yellow)(css)}`));
}function hasNoOtherChildNodes(nodes = [], node = _postcss2.default.root()) {
  return nodes.filter(child => child !== node).length === 0;
}function buildCritical(options = {}) {
  const filteredOptions = Object.keys(options).reduce((acc, key) => typeof options[key] !== 'undefined' ? (0, _extends3.default)({}, acc, { [key]: options[key] }) : acc, {});
  const args = (0, _extends3.default)({
    outputPath: process.cwd(),
    outputDest: 'critical.css',
    preserve: true,
    minify: true,
    dryRun: false,
    ignoreSelectors: [':export', ':import']
  }, filteredOptions);
  append = false;
  return (() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (css) {
      const dryRun = args.dryRun,
            preserve = args.preserve,
            minify = args.minify,
            outputPath = args.outputPath,
            outputDest = args.outputDest;

      const criticalOutput = (0, _getCriticalRules.getCriticalRules)(css, outputDest);
      let result = {};

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(criticalOutput)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let outputFile = _step.value;

          const criticalCSS = _postcss2.default.root();
          const filePath = _path2.default.join(outputPath, outputFile);
          criticalOutput[outputFile].each(function (rule) {
            const shouldIgnore = rule.selector && args.ignoreSelectors.some(function (ignore) {
              return rule.selector.includes(ignore);
            });
            if (shouldIgnore) {
              return;
            }

            return criticalCSS.append(rule.clone());
          });
          result = yield (0, _postcss2.default)(minify ? [_cssnano2.default] : []).process(criticalCSS, { from: undefined });
          yield dryRunOrWriteFile(dryRun, filePath, result);
          clean(css, preserve);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return result;
    });

    return function (_x6) {
      return _ref3.apply(this, arguments);
    };
  })();
}

module.exports = _postcss2.default.plugin('postcss-critical', buildCritical);