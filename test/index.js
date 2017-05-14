#!/usr/bin/env node

const { cyan } = require('chalk')
const fs = require('fs')
const test = require('tape')
const basePath = `${process.cwd()}/test/fixtures`
const chalk = require('chalk')
const cliArgs = require('minimist')(process.argv.slice(2))

function compareCritical (t, name, testNonCritical) {
  const actualFilename = name.indexOf('default') !== -1 && !testNonCritical
    ? 'critical'
    : `${name}.${testNonCritical ? 'non-critical.actual' : 'critical.actual'}`
  console.log(cyan.bold(actualFilename))
  t.equal(
    fs.readFileSync(`${basePath}/${actualFilename}.css`, 'utf8').trim(),
    fs
      .readFileSync(
        `${basePath}/${name}.${testNonCritical ? 'non-critical.expected' : 'critical.expected'}.css`,
        'utf8'
      )
      .trim(),
    `processed fixture ${chalk.bold(name)} should be equal to expected output`
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
    }
  }

  if (key) {
    tests[key]()
  } else {
    Object.keys(tests).forEach(key => tests[key]())
  }
}

initTests(cliArgs.test)
