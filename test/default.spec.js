const compareCritical = require('./compareCritical');
const { normalizeOpts } = require('./utils');
const preTest = require('./preTest');

describe('default tests', () => {
  const opts = normalizeOpts();
  beforeAll(async () => {
    await preTest('default', opts);
  });

  it('should move styles into critical stylesheet if @critical at-rule is used', () => {
    compareCritical(opts, 'default')
  })

  it('should not modify non-critical stylesheet', () => {
    compareCritical(opts, 'default', true)
  })
})
