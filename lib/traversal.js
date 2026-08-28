'use strict'

exports.addPrivate = addPrivate
exports.identity = identity

var fs = require('graceful-fs')

function addPrivate (object, key, value) {
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: false,
    value: value,
    writable: true
  })
  return value
}

function identity (stat, canonicalPath) {
  if (stat && (stat.dev || stat.ino)) {
    return 'inode:' + String(stat.dev) + ':' + String(stat.ino)
  }
  try {
    canonicalPath = fs.realpathSync(canonicalPath)
  } catch (_) {}
  return 'path:' + canonicalPath
}
