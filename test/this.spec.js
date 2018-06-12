const compareCritical = require('./compareCritical');
const { fsTimeout, getDefaultOpts } = require('./utils');
const preTest = require('./preTest');

const opts = getDefaultOpts({ minify: true });

beforeAll(async () => {
  preTest('this', opts);
  await fsTimeout();
});

describe('tests for `critical-selector: this`', () => {
  it('should move selector to critical css if `critical-selector: this` is declared', () => {
    compareCritical(opts, 'this')
  })

  it('should remove critical-selector declarations from non-critical css and leave it otherwise unmodified', () => {
    compareCritical(opts, 'this', true)
  })
})
