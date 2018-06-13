const compareCritical = require('./compareCritical');
const { normalizeOpts } = require('./utils');
const preTest = require('./preTest');

const opts = normalizeOpts();
beforeAll(async () => {
  await preTest('this', opts);
});

describe('tests for `critical-selector: this`', () => {
  it('should move selector to critical css if `critical-selector: this` is declared', () => {
    compareCritical(opts, 'at-root')
  })

  it('should remove critical-selector declarations from non-critical css and leave it otherwise unmodified', () => {
    compareCritical(opts, 'at-root', true)
  })
})

describe('tests for a selector containing `critical-selector: this` within a @media at-rule', () => {
  it('should move a selector within a media at-rule into critical css, maintaing @media at-rule', () => {
    compareCritical(opts, 'media')
  })

  it('should remove critical declarations from non-critical css', () => {
    compareCritical(opts, 'media', true)
  })
})

describe('tests for a selector containing `critical-selector: this`, adjacent to multiple other selectors, within a @media at-rule', () => {
  it('should move only the selector contianing `critical-selector: this` to critical CSS, maintaing @media at-rule', () => {
    compareCritical(opts, 'multiple')
  })

  it('should remove critical declarations from non-critical css', () => {
    compareCritical(opts, 'multiple', true)
  })
})
