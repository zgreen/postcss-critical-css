#!/usr/bin/env node
const fs = require('fs')
const { bold, red } = require('chalk')
const postcssCriticalCSS = require('..')
const cliArgs = require('minimist')(process.argv.slice(2), {
  boolean: ['minify', 'preserve'],
  default: { minify: true, preserve: true }
})
const fixturesDir = cliArgs['fixtures-dir'] || 'fixtures'
let basePath = cliArgs.outputPath || `${process.cwd()}/test/${fixturesDir}`
let pluginOpts = Object.assign(
  {},
  {
    minify: cliArgs.minify,
    outputDest: cliArgs.outputDest,
    outputPath: basePath,
    preserve: typeof cliArgs.preserve !== 'undefined' ? cliArgs.preserve : true
  }
)
if (cliArgs.noArgs) {
  basePath = process.cwd()
  pluginOpts = {}
}

function useFileData (data, file) {
  postcssCriticalCSS
    .process(data, {}, pluginOpts)
    .catch(err => {
      console.error(bold.red('Error: '), err)
      process.exit(1)
    })
    .then(result => {
      fs.writeFile(
        `${basePath}/${file.split('.')[0]}.non-critical.actual.css`,
        result.css,
        'utf8',
        err => {
          if (err) {
            throw new Error(err)
          }
        }
      )
    })
}

function deleteOldFixtures (files) {
  let totalProcessed = 0
  files.forEach(file => {
    if (file.indexOf('.actual') !== -1 || file === 'critical.css') {
      fs.unlink(`${basePath}/${file}`, err => {
        if (err) {
          throw new Error(err)
        }
        totalProcessed++
        writeNewFixtures(totalProcessed, files)
      })
    } else {
      totalProcessed++
      writeNewFixtures(totalProcessed, files)
    }
  })
}

function writeNewFixtures (totalProcessed, files) {
  if (totalProcessed !== files.length) {
    return
  }
  files.forEach(file => {
    if (
      file.indexOf('.css') !== -1 &&
      file.indexOf('.expected') === -1 &&
      file.indexOf('.actual') === -1 &&
      file !== 'critical.css'
    ) {
      fs.readFile(`${basePath}/${file}`, 'utf8', (err, data) => {
        if (err) {
          throw new Error(err)
        }
        useFileData(data, file)
      })
    }
  })
}

fs.readdir(basePath, 'utf8', (err, files) => {
  if (err) {
    throw new Error(err)
  }
  deleteOldFixtures(files)
})
