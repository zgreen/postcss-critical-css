#!/usr/bin/env node
var fs = require('fs')
var test = require('tape')
var postcss = require('postcss')
var postcssCriticalCSS = require('..');

const basePath = `${process.cwd()}/test/fixtures`;
function cb (files) {
  function useFileData (data, file) {
    postcss([postcssCriticalCSS({outputPath: basePath})])
      .process(data)
      .then(result => fs.writeFile(`${basePath}/${file.split('.')[0]}.non-critical.actual.css`, result.css))
  }
  files.forEach(function(file) {
    if (file.indexOf('.expected') === -1 && file.indexOf('.actual') === -1) {
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
