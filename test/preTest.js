#!/usr/bin/env node
const fs = require('fs')
const { bold, red } = require('chalk')
const postcssCriticalCSS = require('..')
const { getDefaultOpts } = require('./utils');
const postcss = require('postcss')

function useFileData (data, file, opts) {
  const pluginOpts = getDefaultOpts({
    minify: opts.minify,
    outputDest: opts.outputDest,
    outputPath: opts.basePath,
    preserve: typeof opts.preserve !== 'undefined' ? opts.preserve : true
  });

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
          `${opts.basePath}/${file.split('.')[0]}.non-critical.actual.css`,
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
        fs.unlinkSync(`${opts.basePath}/${file}`)
      } catch(err) {
        throw new Error(err)
      }
    }
  })
}

function writeNewFixtures (files, filter, opts) {
  files.forEach((file) => {
    if (
      file.includes('.css') &&
      file.includes(filter) &&
      ! file.includes('.expected') &&
      ! file.includes('.actual') &&
      file !== 'critical.css'
    ) {
      try {
        const data = fs.readFileSync(`${opts.basePath}/${file}`, 'utf8')
        useFileData(data, file, opts)
      } catch(err) {
        throw new Error(err)
      }
    }
  })
}

module.exports = function preTest(filter, opts) {
  opts.basePath = opts.outputPath || `${process.cwd()}/test/fixtures`
  if (opts.noArgs) {
    opts.basePath = process.cwd()
  }

  try {
    const files = fs.readdirSync(opts.basePath, 'utf8')
    deleteOldFixtures(files, filter, opts)
    writeNewFixtures(files, filter, opts)
  } catch(err) {
    throw new Error(err)
  }
}
