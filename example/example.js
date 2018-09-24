#!/usr/bin/env node
var fs = require('fs')
var test = require('tape')
var postcss = require('postcss')
var postcssCriticalCSS = require('..')

const basePath = `${process.cwd()}/example`
function cb (files) {
  function useFileData (data, file) {
    postcss([postcssCriticalCSS({ outputPath: basePath })])
      .process(data, { from: undefined })
      .then(result => {
        fs.writeFile(
          `${basePath}/${file.split('.')[0]}.non-critical.css`,
          result.css,
          err => {
            if (err) {
              console.error(`ERROR: `, err)
              process.exit(1)
            }
          }
        )
      })
  }
  files.forEach(function (file) {
    if (file === 'example.css') {
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
  cb(files)
})
