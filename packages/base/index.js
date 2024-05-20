if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/base.cmn.js')
} else {
  module.exports = require('./dist/base.cmn.js')
}
