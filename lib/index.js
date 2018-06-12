'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Do a dry run, console.log the output.
 *
 * @param {string} css CSS to output.
 */
var doDryRun = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(css) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log(
            // eslint-disable-line no-console
            (0, _chalk.green)('Critical CSS result is: ' + (0, _chalk.yellow)(css)));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function doDryRun(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Do a dry run, or write a file.
 *
 * @param {bool} dryRun Do a dry run?
 * @param {string} filePath Path to write file to.
 * @param {Object} result PostCSS root object.
 * @return {Promise} Resolves with writeCriticalFile or doDryRun function call.
 */


var dryRunOrWriteFile = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(dryRun, filePath, result) {
    var css;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            css = result.css;

            if (!dryRun) {
              _context2.next = 6;
              break;
            }

            _context2.next = 4;
            return doDryRun(css);

          case 4:
            _context2.next = 8;
            break;

          case 6:
            _context2.next = 8;
            return writeCriticalFile(filePath, css);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function dryRunOrWriteFile(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

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
var writeCriticalFile = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(filePath, css) {
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _fsExtra2.default.outputFile(filePath, css, { flag: append ? 'a' : 'w' }, function (err) {
              append = true;
              if (err) {
                console.error(err);
                process.exit(1);
              }
            });

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function writeCriticalFile(_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}();

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
}function hasNoOtherChildNodes() {
  var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _postcss2.default.root();

  return nodes.filter(function (child) {
    return child !== node;
  }).length === 0;
}function buildCritical() {
  var _this = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var filteredOptions = Object.keys(options).reduce(function (acc, key) {
    return typeof options[key] !== 'undefined' ? (0, _extends4.default)({}, acc, (0, _defineProperty3.default)({}, key, options[key])) : acc;
  }, {});
  var args = (0, _extends4.default)({
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
      return (0, _postcss2.default)(minify ? [_cssnano2.default] : []).process(criticalCSS).then(function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(result) {
          return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return dryRunOrWriteFile(dryRun, filePath, result);

                case 2:
                  clean.bind(null, css, preserve);

                case 3:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this);
        }));

        return function (_x10) {
          return _ref4.apply(this, arguments);
        };
      }());
    }, {});
  };
}

module.exports = _postcss2.default.plugin('postcss-critical', buildCritical);