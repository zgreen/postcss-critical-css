const fs = require('fs-extra');

module.exports = function compareCritical(opts, name, testNonCritical) {
  let basePath = opts.outputPath || `${process.cwd()}/test/fixtures`
  let actual = opts.outputDest || 'critical.css'

  if (opts.noArgs) {
    basePath = process.cwd()
  }

  const expected = testNonCritical
    ? `${name}.non-critical.expected.css`
    : `${name}.critical.expected.css`
  if (
    (name !== 'default' || testNonCritical) &&
    ! opts.outputDest
  ) {
    actual = testNonCritical
      ? `${name}.non-critical.actual.css`
      : `${name}.critical.actual.css`
  }

  expect(fs.readFileSync(`${basePath}/${actual}`, 'utf8').trim())
    .toEqual(fs.readFileSync(`${basePath}/${expected}`, 'utf8').trim())
}
