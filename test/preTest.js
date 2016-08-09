#!/usr/bin/env node
var fs = require('fs')
var test = require('tape')
var postcss = require('postcss')
var postcssCriticalCSS = require('..');

const basePath = `${process.cwd()}/test/fixtures`;
const files = fs.readdirSync(basePath, 'utf8');
files.forEach(function(file) {
  if (file.indexOf('.expected') === -1 && file.indexOf('.actual') === -1) {
    postcss(postcssCriticalCSS({outputPath: basePath}))
      .process(fs.readFileSync(`${basePath}/${file}`, 'utf8')
      .trim());
  }
});
