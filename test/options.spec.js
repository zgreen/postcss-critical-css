const path = require('path');
const compareCritical = require('./compareCritical');
const { normalizeOpts } = require('./utils');
const preTest = require('./preTest');

describe('tests for `minify` option', () => {
  const opts = normalizeOpts({ minify: false });
  beforeAll(async () => {
    await preTest('options', opts);
  });

  it('should not minify critical CSS styles if `minify` option is set to `false`', () => {
    compareCritical(opts, 'minify-false')
  })
})

describe('tests for `preserve` option', () => {
  const opts = normalizeOpts({ preserve: false });
  beforeAll(async () => {
    await preTest('options', opts);
  });

  it('should move selectors specified with `@critical` or `critical-selector` to critical css file', () => {
    compareCritical(opts, 'preserve')
  })

  it('should remove selectors specified with `@critical` or `critical-selector` from non-critical stylesheet', () => {
    compareCritical(opts, 'preserve', true)
  })
})

describe('tests for `outputDest` option', () => {
  const opts = normalizeOpts({ outputDest: 'test-output-dest.critical.actual.css' });
  beforeAll(async () => {
    await preTest('options', opts);
  });

  it('should output critical css to filename configured in `outputDest` option', () => {
    compareCritical(opts, 'output-dest')
  })
})

describe('tests for `outputPath` option', () => {
  const opts = normalizeOpts({ outputPath: path.join(__dirname, 'fixtures/options/outputPath') });
  beforeAll(async () => {
    await preTest('options', opts);
  });

  it('should output critical css to path configured in `outputPath` option', () => {
    compareCritical(opts, 'output-path')
  })
})

describe('tests for `ignoreSelectors` option', () => {
  const opts = normalizeOpts({ ignoreSelectors: [ 'foo', 'bar' ] });
  beforeAll(async () => {
    await preTest('options', opts);
  });

  it('should remove configured selectors in `ignoreSelectors` option from all critical stylesheets', () => {
    compareCritical(opts, 'ignore-selectors')
  })
})
