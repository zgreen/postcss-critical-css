#!/usr/bin/env node
const fs = require('fs')
const { bold, red } = require('chalk')
const postcssCriticalCSS = require('..')
const { normalizeOpts } = require('./utils');
const postcss = require('postcss')

function useFileData (data, file, opts) {
  const pluginOpts = normalizeOpts(opts)

  postcss()
    .use(postcssCriticalCSS(pluginOpts))
    .process(data, { from: file })
    .catch(err => {
      console.error(bold.red('Error: '), err)
      process.exit(1)
    })
    .then((result) => {
      try {
        fs.writeFileSync(
          `${opts.outputPath}/${file.split('.')[0]}.non-critical.actual.css`,
          result.css,
          'utf8'
        )
      } catch(err) {
        throw new Error(err)
      }
    })
}

function deleteOldFixtures (files, filter, opts) {
  files.forEach((file) => {
    if (
      (file.includes('.actual') && file.includes(filter)) ||
      file === 'critical.css'
    ) {
      try {
        fs.unlinkSync(`${opts.outputPath}/${file}`)
      } catch(err) {
        throw new Error(err)
      }
    }
  })
}

function writeNewFixtures (files, name, opts) {
  files.forEach((file) => {
    if (
      file.includes('.css') &&
      ! file.includes('.expected') &&
      ! file.includes('.actual') &&
      file !== 'critical.css'
    ) {
      try {
        const data = fs.readFileSync(`${opts.outputPath}/${file}`, 'utf8')
        useFileData(data, file, opts)
      } catch(err) {
        throw new Error(err)
      }
    }
  })
}

module.exports = function preTest(name, opts) {
  opts.outputPath = opts.outputPath || `${process.cwd()}/test/fixtures/${name}`
  if (opts.noArgs) {
    opts.outputPath = process.cwd()
  }

  try {
    const files = fs.readdirSync(opts.outputPath, 'utf8')
    deleteOldFixtures(files, name, opts)
    writeNewFixtures(files, name, opts)
  } catch(err) {
    throw new Error(err)
  }
}
