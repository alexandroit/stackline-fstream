'use strict'

module.exports = mkdir

var fs = require('graceful-fs')

// Keep mkdirp's callback contract: the second argument is the first directory
// created, or undefined when the complete path already existed.
function mkdir (target, mode, callback) {
  fs.mkdir(target, { recursive: true, mode: mode }, callback)
}
