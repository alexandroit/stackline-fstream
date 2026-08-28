'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var fstream = require('..')
var helpers = require('./helpers.js')

test('walks and copies a wide tree without duplicate or missing entries', function (t) {
  var root = helpers.makeTemp('wide')
  var source = path.join(root, 'source')
  var destination = path.join(root, 'destination')
  fs.mkdirSync(source)
  for (var index = 0; index < 750; index++) {
    fs.writeFileSync(path.join(source, 'file-' + String(index).padStart(4, '0')), String(index))
  }

  helpers.readTree(fstream, { path: source, type: 'Directory', sort: 'alpha' })
    .then(function (result) {
      t.equal(result.entries.length, 750)
      t.equal(new Set(result.entries.map(function (entry) { return entry.path })).size, 750)
      return helpers.copyTree(fstream, source, destination, { sort: 'alpha' })
    }).then(function () {
      t.equal(fs.readdirSync(destination).length, 750)
      t.equal(fs.readFileSync(path.join(destination, 'file-0749'), 'utf8'), '749')
    }).then(function () {
      fs.rmSync(root, { force: true, recursive: true })
      t.end()
    }, function (error) {
      fs.rmSync(root, { force: true, recursive: true })
      t.fail(error)
      t.end()
    })
})

test('walks a deep tree with bounded asynchronous traversal', function (t) {
  var root = helpers.makeTemp('deep')
  var cursor = root
  var depth = 180
  for (var index = 0; index < depth; index++) {
    cursor = path.join(cursor, 'd')
    fs.mkdirSync(cursor)
  }
  fs.writeFileSync(path.join(cursor, 'leaf'), 'leaf')

  helpers.readTree(fstream, { path: root, type: 'Directory' }).then(function (result) {
    t.equal(result.entries.length, depth + 1)
    t.equal(result.entries.some(function (entry) {
      return entry.type === 'File' && entry.data === 'leaf'
    }), true)
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('many hard-link traversals do not populate process-global state', function (t) {
  if (process.platform === 'win32') {
    t.pass('hard-link stress coverage runs on Unix')
    return t.end()
  }

  var root = helpers.makeTemp('hardlink-stress')
  for (var index = 0; index < 250; index++) {
    var first = path.join(root, 'a-' + index)
    fs.writeFileSync(first, String(index))
    fs.linkSync(first, path.join(root, 'b-' + index))
  }

  helpers.readTree(fstream, { path: root, type: 'Directory', sort: 'alpha' })
    .then(function (firstResult) {
      t.equal(firstResult.entries.length, 500)
      t.equal(firstResult.entries.filter(function (entry) {
        return entry.type === 'Link'
      }).length, 250)
      t.deepEqual(Object.keys(fstream.Reader.hardLinks), [])
      return helpers.readTree(fstream, { path: root, type: 'Directory', sort: 'alpha' })
    }).then(function (secondResult) {
      t.equal(secondResult.entries.filter(function (entry) {
        return entry.type === 'Link'
      }).length, 250, 'a later traversal starts with independent state')
    }).then(function () {
      fs.rmSync(root, { force: true, recursive: true })
      t.end()
    }, function (error) {
      fs.rmSync(root, { force: true, recursive: true })
      t.fail(error)
      t.end()
    })
})
