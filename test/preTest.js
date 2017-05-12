#!/usr/bin/env node
const fs = require('fs')
const {bold, red} = require('chalk')
const postcssCriticalCSS = require('..')
const basePath = `${process.cwd()}/test/fixtures`

function useFileData (data, file) {
  postcssCriticalCSS
    .process(data, {}, {outputPath: basePath})
    .catch(err => {
      console.error(bold.red('Error: '), err)
      process.exit(1)
    })
    .then(result =>
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
    )
}

function cb (files) {
  files.forEach(function (file) {
    // Ignore any critical.css file(s) already written
    if (file !== 'critical.css') {
      if (file.indexOf('.actual') !== -1) {
        fs.unlink(`${basePath}/${file}`, err => {
          if (err) {
            throw new Error(err)
          }
        })
      }
      if (file.indexOf('.expected') === -1 && file.indexOf('.actual') === -1) {
        fs.readFile(`${basePath}/${file}`, 'utf8', (err, data) => {
          if (err) {
            throw new Error(err)
          }
          useFileData(data, file)
        })
      }
    }
  })
}

fs.readdir(basePath, 'utf8', (err, files) => {
  if (err) {
    throw new Error(err)
  }
  cb(files)
})
