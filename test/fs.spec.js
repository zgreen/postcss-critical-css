const fs = require('fs-extra');
const path = require('path');
const postcss = require('postcss');
const compareCritical = require('./compareCritical');
const { normalizeOpts } = require('./utils');
const postcssCriticalCSS = require('..')

describe('tests for file writing functionality', () => {
  it('should be capable of copying critical CSS from multiple sources into a single file without overwrites', async () => {
    const fixturePath = path.join(__dirname, 'fixtures/fs');
    const pluginOpts = normalizeOpts({
      outputPath: fixturePath,
      outputDest: 'fs.critical.actual.css',
      minify: false
    });
    const files = await fs.readdir(fixturePath)
    const processor = postcss()
      .use(postcssCriticalCSS(pluginOpts))

    for (let file of files) {
      const css = await fs.readFile(path.join(fixturePath, file), 'utf8');
      await processor.process(css, { from: file })
    }

    compareCritical(pluginOpts, 'fs')
  })
})
