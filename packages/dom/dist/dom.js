if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dom.common.min.js')
} else {
  module.exports = require('./dom.common.js')
}
