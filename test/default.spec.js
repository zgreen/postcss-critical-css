const compareCritical = require('./compareCritical');
const { fsTimeout, normalizeOpts } = require('./utils');
const preTest = require('./preTest');

describe('default tests', () => {
  const opts = normalizeOpts();
  beforeAll(async () => {
    preTest('default', opts);
    await fsTimeout();
  });

  it('should move styles into critical stylesheet if @critical at-rule is used', () => {
    compareCritical(opts, 'default')
  })

  it('should not modify non-critical stylesheet', () => {
    compareCritical(opts, 'default', true)
  })
})

describe('tests for `minify` option', () => {
  const opts = normalizeOpts({ minify: false });
  beforeAll(async () => {
    preTest('options', opts);
    await fsTimeout();
  });

  it('should not minify critical CSS styles if `minify` option is set to `false`', () => {
    compareCritical(opts, 'minify-false')
  })
})

describe('tests for `preserve` option', () => {
  const opts = normalizeOpts({ preserve: false });
  beforeAll(async () => {
    preTest('options', opts);
    await fsTimeout();
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
    preTest('options', opts);
    await fsTimeout();
  });

  it('should output critical css to filename configured in `outputDest` option', () => {
    compareCritical(opts, 'output-dest')
  })
})

describe('tests for `outputPath` option', () => {
  const opts = normalizeOpts({ outputPath: `${process.cwd()}/test/fixtures/options/outputPath` });
  beforeAll(async () => {
    preTest('options', opts);
    await fsTimeout();
  });

  it('should output critical css to filename configured in `outputDest` option', () => {
    compareCritical(opts, 'output-path')
  })
})
