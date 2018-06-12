const compareCritical = require('./compareCritical');
const { fsTimeout, getDefaultOpts } = require('./utils');
const preTest = require('./preTest');

const opts = getDefaultOpts();

beforeAll(async () => {
  preTest('default', opts);
  await fsTimeout();
});

describe('default tests', () => {
  it('should move styles into critical stylesheet if @critical at-rule is used', () => {
    compareCritical(opts, 'default')
  })

  it('should not modify non-critical stylesheet', () => {
    compareCritical(opts, 'default', true)
  })
})

// function initTests (key) {
//   const tests = {
//     this: () => {
//       test('Testing "this" critical result', t => {
//         compareCritical(t, 'this')
//       })

//       test('Testing "this" non-critical result', t => {
//         compareCritical(t, 'this', true)
//       })
//     },

//     atRule: () => {
//       test('Testing "atRule" critical result', t => {
//         compareCritical(t, 'atRule')
//       })

//       test('Testing "atRule" non-critical result', t => {
//         compareCritical(t, 'atRule', true)
//       })
//     },

//     atRuleWrapping: () => {
//       test(
//         chalk.yellow(
//           `Testing ${chalk.bold('atRule.wrapping')} critical result`
//         ),
//         t => {
//           compareCritical(t, 'atRule-wrapping')
//         }
//       )

//       test(
//         chalk.yellow(
//           `Testing ${chalk.bold('atRule.wrapping')} non-critical result`
//         ),
//         t => {
//           compareCritical(t, 'atRule-wrapping', true)
//         }
//       )
//     },

//     media: () => {
//       test('Testing "media" critical result', t => {
//         compareCritical(t, 'media')
//       })

//       test('Testing "media" non-critical result', t => {
//         compareCritical(t, 'media', true)
//       })
//     },

//     scope: () => {
//       test(
//         chalk.yellow(`Testing ${chalk.bold('scope')} critical result`),
//         t => {
//           compareCritical(t, 'scope')
//         }
//       )

//       test(
//         chalk.yellow(`Testing ${chalk.bold('scope')} non-critical result`),
//         t => {
//           compareCritical(t, 'scope', true)
//         }
//       )
//     },

//     mediaScope: () => {
//       test(
//         chalk.yellow(`Testing ${chalk.bold('media-scope')} critical result`),
//         t => {
//           compareCritical(t, 'media-scope')
//         }
//       )

//       test(
//         chalk.yellow(
//           `Testing ${chalk.bold('media-scope')} non-critical result`
//         ),
//         t => {
//           compareCritical(t, 'media-scope', true)
//         }
//       )
//     },

//     mediaThis: () => {
//       test(
//         chalk.yellow(`Testing ${chalk.bold('media-this')} critical result`),
//         t => {
//           compareCritical(t, 'media-this')
//         }
//       )

//       test(
//         chalk.yellow(`Testing ${chalk.bold('media-this')} non-critical result`),
//         t => {
//           compareCritical(t, 'media-this', true)
//         }
//       )
//     }
//   }

//   if (key) {
//     const keys = key.split(',')
//     keys.forEach(k => tests[k]())
//   } else {
//     Object.keys(tests).forEach(key => tests[key]())
//   }
// }

// initTests(cliArgs.test)
