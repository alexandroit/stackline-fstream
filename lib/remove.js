'use strict'

module.exports = remove

var fs = require('graceful-fs')

// fs.rm is available throughout the supported Node >=14.15.1 range.  force
// preserves rimraf's missing-path behavior while recursive handles directories.
function remove (target, callback) {
  fs.rm(target, { force: true, recursive: true }, callback)
}
