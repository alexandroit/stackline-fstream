'use strict'

var fs = require('fs')
var os = require('os')
var path = require('path')

exports.copyTree = copyTree
exports.makeTemp = makeTemp
exports.readFile = readFile
exports.readTree = readTree
exports.wait = wait
exports.writeFile = writeFile

function makeTemp (name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-fstream-' + name + '-'))
}

function wait (milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds)
  })
}

function readTree (fstream, options) {
  return new Promise(function (resolve, reject) {
    var root = typeof options === 'string'
      ? fstream.Reader(options)
      : fstream.Reader(options)
    var entries = []
    var warnings = []
    var events = []

    root.on('ready', function () { events.push('root:ready') })
    root.on('warn', function (error) {
      warnings.push({ code: error.code, path: error.path })
    })
    root.on('child', function (entry) {
      var chunks = []
      entry.on('data', function (chunk) { chunks.push(Buffer.from(chunk)) })
      entry.on('end', function () {
        entries.push({
          data: chunks.length ? Buffer.concat(chunks).toString('utf8') : '',
          linkpath: entry.linkpath || null,
          path: path.relative(root.path, entry.path).replace(/\\/g, '/'),
          ready: entry.ready,
          type: entry.type
        })
      })
    })
    root.on('error', reject)
    root.on('end', function () { events.push('root:end') })
    root.on('close', function () {
      events.push('root:close')
      resolve({ entries: entries, events: events, root: root, warnings: warnings })
    })
  })
}

function readFile (fstream, target) {
  return new Promise(function (resolve, reject) {
    var chunks = []
    var reader = fstream.Reader({ path: target, type: 'File' })
    reader.on('data', function (chunk) { chunks.push(Buffer.from(chunk)) })
    reader.on('error', reject)
    reader.on('close', function () {
      resolve({ data: Buffer.concat(chunks), reader: reader })
    })
  })
}

function writeFile (fstream, target, contents, properties) {
  return new Promise(function (resolve, reject) {
    var options = Object.assign({ path: target, type: 'File' }, properties)
    var writer = fstream.Writer(options)
    writer.on('error', reject)
    writer.on('close', function () { resolve(writer) })
    writer.end(contents)
  })
}

function copyTree (fstream, source, destination, readerOptions) {
  return new Promise(function (resolve, reject) {
    var options = Object.assign({ path: source }, readerOptions)
    var reader = fstream.Reader(options)
    var writer = fstream.Writer({ path: destination, type: 'Directory' })
    var settled = false

    function fail (error) {
      if (settled) return
      settled = true
      reject(error)
    }

    reader.on('error', fail)
    writer.on('error', fail)
    writer.on('close', function () {
      if (settled) return
      settled = true
      resolve({ reader: reader, writer: writer })
    })
    reader.pipe(writer)
  })
}
