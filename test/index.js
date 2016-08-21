#!/usr/bin/env node

var fs = require('fs')
var test = require('tape')
var postcss = require('postcss')
var postcssCriticalCSS = require('..');
const basePath = `${process.cwd()}/test/fixtures`;
const chalk = require('chalk');

function fixturePath(name) {
  return 'test/fixtures/' + name + '.css';
}

function fixture(name) {
  return fs.readFileSync(fixturePath(name), 'utf8').trim();
}

function resolveFixture(name, options) {
  return postcss(postcssCriticalCSS(options))
    .process(fixture(name), {from: fixturePath(name)});
}

function compareFixtures(t, name, options) {
  var postcssResult = resolveFixture(name, options);
  var actual = postcssResult.css.trim();

  fs.writeFile(fixturePath(name + '.actual'), actual);

  var expected = fixture(name + '.expected');
  t.equal(
    actual, expected,
    'processed fixture ' + chalk.bold(name) + ' should be equal to expected output'
  );

  return postcssResult;
}

function compareCritical(t, name) {
  t.equal(
    fs.readFileSync(`${basePath}/${name}.critical.actual.css`, 'utf8').trim(),
    fs.readFileSync(`${basePath}/${name}.critical.expected.css`, 'utf8').trim(),
    `processed fixture ${chalk.bold(name)} should be equal to expected output`
  );
}

test('Testing "this" critical result', function(t) {
  compareCritical(t, 'this');
  t.end();
});

test('Testing "this" non-critical result', function(t) {
  compareFixtures(t, 'this');
  t.end();
});

test('Testing "this" critical result', function(t) {
  compareCritical(t, 'atRule');
  t.end();
});

test('Testing "this" non-critical result', function(t) {
  compareFixtures(t, 'atRule');
  t.end();
});
