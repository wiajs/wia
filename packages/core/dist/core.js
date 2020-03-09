if (process.env.NODE_ENV === 'production') {
  module.exports = require('./core.common.min.js')
} else {
  module.exports = require('./core.common.js')
}
