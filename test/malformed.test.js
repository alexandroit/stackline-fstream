'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var fstream = require('..')
var helpers = require('./helpers.js')

test('missing and malformed constructor arguments fail predictably', function (t) {
  t.throws(function () { fstream.Reader() }, TypeError)
  t.throws(function () { fstream.Reader({}) }, /Must provide a path/)
  t.throws(function () { fstream.Writer() }, TypeError)
  t.throws(function () { fstream.Writer({}) }, /Must provide a path/)
  t.throws(function () {
    new fstream.DirReader({ path: '.', type: 'File', File: true })
  }, /Non-directory type/)
  t.throws(function () {
    new fstream.FileWriter({ path: 'x', type: 'Directory', Directory: true })
  }, /Non-file type/)
  t.end()
})

test('missing inputs and expected-size mismatches retain decorated errors', function (t) {
  var root = helpers.makeTemp('malformed-errors')
  var missing = path.join(root, 'missing.txt')
  var file = path.join(root, 'file.txt')
  fs.writeFileSync(file, 'three')
  var errors = []

  var missingReader = fstream.Reader(missing)
  missingReader.on('error', function (error) {
    errors.push(error)
    t.equal(error.code, 'ENOENT')
    t.equal(error.fstream_path, missing)
    t.equal(error.fstream_class, 'FileReader')
    done()
  })

  var sizedReader = fstream.Reader({ path: file, size: 100 })
  sizedReader.on('error', function (error) {
    errors.push(error)
    t.equal(error.message, 'incorrect size')
    t.equal(error.fstream_path, file)
    done()
  })

  function done () {
    if (errors.length !== 2) return
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }
})

test('file writers reject non-buffer, non-string chunks before readiness', function (t) {
  var root = helpers.makeTemp('malformed-write')
  var writer = fstream.Writer({ path: path.join(root, 'file.txt'), type: 'File' })
  writer.on('error', t.fail)
  t.throws(function () { writer.write({ not: 'bytes' }) }, /invalid write data/)
  writer.on('close', function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  })
  writer.end('valid')
})

test('an explicit incompatible directory type reports the filesystem mismatch', function (t) {
  var root = helpers.makeTemp('malformed-type')
  var file = path.join(root, 'file.txt')
  fs.writeFileSync(file, 'file')
  var reader = fstream.Reader({ path: file, type: 'Directory' })
  var errors = 0

  reader.on('error', function (error) {
    errors++
    t.equal(error.code, 'ENOTDIR')
    fs.rmSync(root, { force: true, recursive: true })
    t.equal(errors, 1)
    t.end()
  })
})

test('warn events carry stable path, type, class, and code context', function (t) {
  var abstract = new fstream.Abstract()
  abstract.path = '/virtual/example'
  abstract._path = abstract.path
  abstract.type = 'File'
  abstract.on('warn', function (error) {
    t.equal(error.code, 'EXAMPLE')
    t.equal(error.path, abstract.path)
    t.equal(error.fstream_path, abstract.path)
    t.equal(error.fstream_type, 'File')
    t.equal(error.fstream_class, 'Abstract')
    t.equal(Array.isArray(error.fstream_stack), true)
    t.end()
  })
  abstract.warn('example warning', 'EXAMPLE')
})

test('late ready listeners and abstract lifecycle events retain context', function (t) {
  t.plan(8)
  var abstract = new fstream.Abstract()
  abstract.path = '/visible/example'
  abstract._path = '/unc/example'
  abstract.type = 'SymbolicLink'
  abstract.linkpath = '/target/example'
  abstract.ready = true

  abstract.on('ready', function () {
    t.pass('a late ready listener is scheduled')
  })
  abstract.on('abort', function () {
    t.pass('abort remains observable')
  })
  abstract.on('info', function (message, code) {
    t.equal(message, 'detail')
    t.equal(code, 'DETAIL')
  })
  abstract.on('error', function (error) {
    t.equal(error.code, 'EXAMPLE')
    t.equal(error.fstream_unc_path, abstract._path)
    t.equal(error.fstream_linkpath, abstract.linkpath)
    t.equal(error.fstream_class, 'Abstract')
  })

  abstract.abort()
  abstract.info('detail', 'DETAIL')
  abstract.error('example error', 'EXAMPLE')
})

test('hardlinks:false reads every linked path as file content', function (t) {
  if (process.platform === 'win32') {
    t.pass('hard-link option coverage runs on Unix')
    return t.end()
  }

  var root = helpers.makeTemp('hardlinks-disabled')
  var first = path.join(root, 'a')
  fs.writeFileSync(first, 'bytes')
  fs.linkSync(first, path.join(root, 'b'))
  helpers.readTree(fstream, {
    path: root,
    hardlinks: false,
    sort: 'alpha',
    type: 'Directory'
  }).then(function (result) {
    t.deepEqual(result.entries.map(function (entry) {
      return [entry.path, entry.type, entry.data]
    }), [['a', 'File', 'bytes'], ['b', 'File', 'bytes']])
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})
