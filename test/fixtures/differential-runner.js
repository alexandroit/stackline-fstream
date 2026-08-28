'use strict'

var fs = require('fs')
var path = require('path')
var moduleId = process.argv[2]
var fixture = process.argv[3]
var fstream = require(moduleId)
var packageRoot = path.dirname(require.resolve(moduleId + '/package.json'))
var result = {
  aliases: {
    dir: fstream.Reader.Dir === fstream.DirReader,
    file: fstream.Writer.File === fstream.FileWriter,
    proxy: fstream.Reader.Proxy === fstream.ProxyReader
  },
  deep: {},
  entries: [],
  events: [],
  keys: Object.keys(fstream)
}

for (var name of [
  'abstract', 'collect', 'dir-reader', 'dir-writer', 'file-reader',
  'file-writer', 'get-type', 'link-reader', 'link-writer', 'proxy-reader',
  'proxy-writer', 'reader', 'socket-reader', 'writer'
]) {
  result.deep[name] = typeof require(path.join(packageRoot, 'lib', name + '.js'))
}

var reader = fstream.Reader({
  path: fixture,
  sort: 'alpha',
  filter: function () { return this.basename !== '.ignored' }
})

result.initial = {
  constructor: reader.constructor.name,
  readable: reader.readable,
  ready: reader.ready,
  writable: reader.writable
}

reader.on('ready', function () { result.events.push('ready') })
reader.on('entry', function (entry) {
  result.events.push('entry:' + path.relative(fixture, entry.path).replace(/\\/g, '/'))
})
reader.on('child', function (entry) {
  var chunks = []
  entry.on('data', function (chunk) { chunks.push(Buffer.from(chunk)) })
  entry.on('end', function () {
    result.entries.push({
      data: chunks.length ? Buffer.concat(chunks).toString('utf8') : '',
      path: path.relative(fixture, entry.path).replace(/\\/g, '/'),
      type: entry.type
    })
  })
})
reader.on('error', function (error) {
  console.error(error.stack)
  process.exitCode = 1
})
reader.on('end', function () { result.events.push('end') })
reader.on('close', function () {
  result.events.push('close')
  result.entries.sort(function (left, right) {
    return left.path < right.path ? -1 : left.path > right.path ? 1 : 0
  })
  process.stdout.write(JSON.stringify(result))
})
