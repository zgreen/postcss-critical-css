const compareCritical = require('./compareCritical');
const { fsTimeout, normalizeOpts } = require('./utils');
const preTest = require('./preTest');

const opts = normalizeOpts();
beforeAll(async () => {
  preTest('atRule', opts);
  await fsTimeout();
});

describe('tests for @critical rule', () => {
  it('should move all selectors in a file to critical css if @critical at-rule is used without wrapping anything', () => {
    compareCritical(opts, 'standalone')
  })

  it('should remove @critical at-rule from non-critical css', () => {
    compareCritical(opts, 'standalone', true)
  })
})

describe('tests for @critical at-rule wrapping specific selectors', () => {
  it('should move all selectors in a file to critical css if @critical rule is used without wrapping anything', () => {
    compareCritical(opts, 'wrapping')
  })

  it('should remove @critical at-rule from non-critical css', () => {
    compareCritical(opts, 'wrapping', true)
  })
})
