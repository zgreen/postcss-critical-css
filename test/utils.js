module.exports.normalizeOpts = (opts = {}) => {
  if (opts.noArgs) {
    return {};
  }

  return Object.assign({
    minify: true,
    preserve: typeof opts.preserve !== 'undefined' ? opts.preserve : true
  }, opts);
}

module.exports.fsTimeout = async () => {
  return new Promise(
    resolve => setTimeout(resolve, 250)
  )
}
