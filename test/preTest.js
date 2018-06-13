#!/usr/bin/env node
const util = require('util');
const fs = require('fs-extra')
const { bold, red } = require('chalk')
const postcssCriticalCSS = require('..')
const { fsTimeout, normalizeOpts } = require('./utils')
const postcss = require('postcss');

async function useFileData (data, file, opts) {
  const pluginOpts = normalizeOpts(opts)

  const result = await postcss()
    .use(postcssCriticalCSS(pluginOpts))
    .process(data, { from: file })

  try {
    await fs.writeFile(
      `${opts.outputPath}/${file.split('.')[0]}.non-critical.actual.css`,
      result.css,
      'utf8'
    )
  } catch(err) {
    throw new Error(err)
  }
}

async function deleteOldFixtures (files, filter, opts) {
  for (let file of files) {
    if (
      (file.includes('.actual') && file.includes(filter)) ||
      file === 'critical.css'
    ) {
      try {
        await fs.unlink(`${opts.outputPath}/${file}`)
      } catch(err) {
        throw new Error(err)
      }
    }
  }
}

async function writeNewFixtures (files, name, opts) {
  for (let file of files) {
    if (
      file.includes('.css') &&
      ! file.includes('.expected') &&
      ! file.includes('.actual') &&
      file !== 'critical.css'
    ) {
      try {
        const data = await fs.readFile(`${opts.outputPath}/${file}`, 'utf8')
        await useFileData(data, file, opts)
      } catch(err) {
        throw new Error(err)
      }
    }
  }
}

module.exports = async function preTest(name, opts) {
  const fixtureRoot = `${process.cwd()}/test/fixtures/`;
  opts.outputPath = opts.outputPath || `${fixtureRoot}${name}`
  if (opts.noArgs) {
    opts.outputPath = process.cwd()
  }

  try {
    const files = await fs.readdir(opts.outputPath, 'utf8')
    await deleteOldFixtures(files, name, opts)
    await writeNewFixtures(files, name, opts)
  } catch(err) {
    throw new Error(err)
  }
}

