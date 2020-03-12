if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/core.common.min.js')
} else {
  module.exports = require('./dist/core.common.js')
}
