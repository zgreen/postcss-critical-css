module.exports.getDefaultOpts = (opts = {}) => {
  if (opts.noArgs) {
    return {};
  }

  return Object.assign({
    preserve: true,
  }, opts);
}

module.exports.fsTimeout = async () => {
  return new Promise(
    resolve => setTimeout(resolve, 250)
  )
}
