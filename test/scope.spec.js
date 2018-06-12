const compareCritical = require('./compareCritical');
const { fsTimeout, normalizeOpts } = require('./utils');
const preTest = require('./preTest');

const opts = normalizeOpts();
beforeAll(async () => {
  preTest('scope', opts);
  await fsTimeout();
});

describe('tests for `critical-selector: scope`', () => {
  it('should move selectors containing `critical-selector: scope` and their children to critical css', () => {
    compareCritical(opts, 'at-root')
  })

  it('should remove critical-selector declaration from non-critical css', () => {
    compareCritical(opts, 'at-root', true)
  })
})

describe('tests for selector containing `critical-selector: scope` nested under @media at-rule', () => {
  it('should move selectors containing `critical-selector: scope` and their children to critical css, maintaing @media at-rule', () => {
    compareCritical(opts, 'media')
  })

  it('should remove critical-selector declaration from non-critical css', () => {
    compareCritical(opts, 'media', true)
  })
})
