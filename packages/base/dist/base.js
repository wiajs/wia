if (process.env.NODE_ENV === 'production') {
  module.exports = require('./base.common.min.js')
} else {
  module.exports = require('./base.common.js')
}
