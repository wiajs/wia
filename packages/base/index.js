if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/base.common.min.js')
} else {
  module.exports = require('./dist/base.common.js')
}
