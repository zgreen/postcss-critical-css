#!/usr/bin/env node
var fs = require('fs')
var test = require('tape')
var postcss = require('postcss')
var postcssCriticalCSS = require('..')

const basePath = `${process.cwd()}/example`
function cb (files) {
  function useFileData (data, file) {
    postcss([postcssCriticalCSS.bind(null, {outputPath: basePath})])
      .process(data)
      .then(result =>
        fs.writeFile(
          `${basePath}/${file.split('.')[0]}.non-critical.css`,
          result.css,
          err => {
            console.error(err)
            process.exit(1)
          }
        )
      )
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
