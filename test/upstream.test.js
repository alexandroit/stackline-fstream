'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var fstream = require('..')
var helpers = require('./helpers.js')

test('upstream CommonJS namespace and constructor aliases are preserved', function (t) {
  t.deepEqual(Object.keys(fstream), [
    'Abstract', 'Reader', 'Writer', 'File', 'Dir', 'Link', 'Proxy',
    'DirReader', 'FileReader', 'LinkReader', 'ProxyReader',
    'DirWriter', 'FileWriter', 'LinkWriter', 'ProxyWriter', 'collect'
  ], 'enumerable root key order matches 1.0.12')
  t.equal(fstream.Reader.Dir, fstream.DirReader)
  t.equal(fstream.Reader.File, fstream.FileReader)
  t.equal(fstream.Reader.Link, fstream.LinkReader)
  t.equal(fstream.Reader.Proxy, fstream.ProxyReader)
  t.equal(fstream.Writer.Dir, fstream.DirWriter)
  t.equal(fstream.Writer.File, fstream.FileWriter)
  t.equal(fstream.Writer.Link, fstream.LinkWriter)
  t.equal(fstream.Writer.Proxy, fstream.ProxyWriter)
  t.equal(require('../fstream.js'), fstream)
  t.equal(require('../index.js'), fstream)
  t.end()
})

test('reader walks, sorts, filters, and emits ready before entries', function (t) {
  var root = helpers.makeTemp('upstream-reader')
  fs.mkdirSync(path.join(root, 'b'))
  fs.mkdirSync(path.join(root, 'a'))
  fs.writeFileSync(path.join(root, 'b', 'two.txt'), 'two')
  fs.writeFileSync(path.join(root, 'a', 'one.txt'), 'one')
  fs.writeFileSync(path.join(root, '.hidden'), 'hidden')

  helpers.readTree(fstream, {
    path: root,
    sort: 'alpha',
    filter: function () { return this.basename !== '.hidden' }
  }).then(function (result) {
    t.equal(result.events[0], 'root:ready')
    t.deepEqual(result.events.slice(-2), ['root:end', 'root:close'])
    t.deepEqual(result.entries.map(function (entry) { return entry.path }).sort(), [
      'a', 'a/one.txt', 'b', 'b/two.txt'
    ])
    t.equal(result.entries.every(function (entry) { return entry.ready }), true)
    t.equal(result.entries.find(function (entry) {
      return entry.path === 'a/one.txt'
    }).data, 'one')
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('reader and writer copy a directory tree and symbolic link', function (t) {
  if (process.platform === 'win32') {
    t.pass('symbolic-link coverage runs in the platform CI job when permitted')
    return t.end()
  }

  var root = helpers.makeTemp('upstream-copy')
  var source = path.join(root, 'source')
  var destination = path.join(root, 'destination')
  fs.mkdirSync(path.join(source, 'nested'), { recursive: true })
  fs.writeFileSync(path.join(source, 'nested', 'file.txt'), 'copied')
  fs.symlinkSync('nested/file.txt', path.join(source, 'link.txt'))

  helpers.copyTree(fstream, source, destination, { sort: 'alpha' }).then(function () {
    t.equal(fs.readFileSync(path.join(destination, 'nested', 'file.txt'), 'utf8'), 'copied')
    t.equal(fs.readlinkSync(path.join(destination, 'link.txt')), 'nested/file.txt')
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('callable and newable factories select the same specialized classes', function (t) {
  var root = helpers.makeTemp('upstream-factories')
  var file = path.join(root, 'file.txt')
  fs.writeFileSync(file, 'factory')

  var calledReader = fstream.Reader({ path: file, type: 'File' })
  var newReader = new fstream.Reader({ path: file, type: 'File' })
  var calledWriter = fstream.Writer({ path: path.join(root, 'called.txt'), type: 'File' })
  var newWriter = new fstream.Writer({ path: path.join(root, 'new.txt'), type: 'File' })

  t.ok(calledReader instanceof fstream.FileReader)
  t.ok(newReader instanceof fstream.FileReader)
  t.ok(calledWriter instanceof fstream.FileWriter)
  t.ok(newWriter instanceof fstream.FileWriter)

  var closed = 0
  function finish () {
    if (++closed !== 4) return
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }
  ;[calledReader, newReader].forEach(function (reader) {
    reader.on('error', t.fail)
    reader.on('close', finish)
  })
  ;[calledWriter, newWriter].forEach(function (writer) {
    writer.on('error', t.fail)
    writer.on('close', finish)
    writer.end('factory')
  })
})

test('collect buffers file data until pipe is released', function (t) {
  var root = helpers.makeTemp('upstream-collect')
  var file = path.join(root, 'file.txt')
  fs.writeFileSync(file, 'buffered')
  var reader = fstream.Reader({ path: file, type: 'File' })
  var chunks = []

  fstream.collect(reader)
  reader.on('data', function (chunk) { chunks.push(chunk) })
  reader.on('error', t.fail)
  reader.on('close', function () {
    t.equal(Buffer.concat(chunks).toString(), 'buffered')
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  })
  reader.pipe()
})
