#!/usr/bin/env node

const { cyan } = require('chalk')
const fs = require('fs')
const test = require('tape')
const chalk = require('chalk')
const cliArgs = require('minimist')(process.argv.slice(2), {
  boolean: ['preserve'],
  default: { preserve: true }
})
const fixturesDir = cliArgs['fixtures-dir'] || 'fixtures'
const basePath = cliArgs.outputPath || `${process.cwd()}/test/${fixturesDir}`

function compareCritical (t, name, testNonCritical) {
  let actual = cliArgs.outputDest || 'critical.css'
  const expected = testNonCritical
    ? `${name}.non-critical.expected.css`
    : `${name}.critical.expected.css`
  if (name !== 'default' || testNonCritical) {
    actual = testNonCritical
      ? `${name}.non-critical.actual.css`
      : `${name}.critical.actual.css`
  }
  console.log(`Comparing: ${expected} and ${actual}`)
  t.equal(
    fs.readFileSync(`${basePath}/${actual}`, 'utf8').trim(),
    fs.readFileSync(`${basePath}/${expected}`, 'utf8').trim(),
    `Expect ${chalk.bold(name)} should be equal to actual output`
  )
  t.end()
}

function initTests (key) {
  const tests = {
    default: () => {
      test('Testing default critical result', t => {
        compareCritical(t, 'default')
      })

      test('Testing default non-critical result', t => {
        compareCritical(t, 'default', true)
      })
    },

    this: () => {
      test('Testing "this" critical result', t => {
        compareCritical(t, 'this')
      })

      test('Testing "this" non-critical result', t => {
        compareCritical(t, 'this', true)
      })
    },

    atRule: () => {
      test('Testing "atRule" critical result', t => {
        compareCritical(t, 'atRule')
      })

      test('Testing "atRule" non-critical result', t => {
        compareCritical(t, 'atRule', true)
      })
    },

    atRuleWrapping: () => {
      test(
        chalk.yellow(
          `Testing ${chalk.bold('atRule.wrapping')} critical result`
        ),
        t => {
          compareCritical(t, 'atRule-wrapping')
        }
      )

      test(
        chalk.yellow(
          `Testing ${chalk.bold('atRule.wrapping')} non-critical result`
        ),
        t => {
          compareCritical(t, 'atRule-wrapping', true)
        }
      )
    },

    media: () => {
      test('Testing "media" critical result', t => {
        compareCritical(t, 'media')
      })

      test('Testing "media" non-critical result', t => {
        compareCritical(t, 'media', true)
      })
    },

    scope: () => {
      test(
        chalk.yellow(`Testing ${chalk.bold('scope')} critical result`),
        t => {
          compareCritical(t, 'scope')
        }
      )

      test(
        chalk.yellow(`Testing ${chalk.bold('scope')} non-critical result`),
        t => {
          compareCritical(t, 'scope', true)
        }
      )
    },

    mediaScope: () => {
      test(
        chalk.yellow(`Testing ${chalk.bold('media-scope')} critical result`),
        t => {
          compareCritical(t, 'media-scope')
        }
      )

      test(
        chalk.yellow(
          `Testing ${chalk.bold('media-scope')} non-critical result`
        ),
        t => {
          compareCritical(t, 'media-scope', true)
        }
      )
    },

    mediaThis: () => {
      test(
        chalk.yellow(`Testing ${chalk.bold('media-this')} critical result`),
        t => {
          compareCritical(t, 'media-this')
        }
      )

      test(
        chalk.yellow(`Testing ${chalk.bold('media-this')} non-critical result`),
        t => {
          compareCritical(t, 'media-this', true)
        }
      )
    }
  }

  if (key) {
    tests[key]()
  } else {
    Object.keys(tests).forEach(key => tests[key]())
  }
}

initTests(cliArgs.test)
