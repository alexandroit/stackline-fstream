'use strict'

var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var fstream = require('..')

var minimum = [14, 15, 1]
var actual = process.versions.node.split('.').map(Number)
var supported = actual[0] > minimum[0] ||
  actual[0] === minimum[0] && (actual[1] > minimum[1] ||
    actual[1] === minimum[1] && actual[2] >= minimum[2])

assert(supported, 'runtime must satisfy Node >=14.15.1')
assert.strictEqual(typeof fs.rm, 'function', 'native recursive removal is available')
assert.deepStrictEqual(Object.keys(fstream), [
  'Abstract', 'Reader', 'Writer', 'File', 'Dir', 'Link', 'Proxy',
  'DirReader', 'FileReader', 'LinkReader', 'ProxyReader',
  'DirWriter', 'FileWriter', 'LinkWriter', 'ProxyWriter', 'collect'
])
assert.strictEqual(require('../fstream.js'), fstream)
assert.strictEqual(require('../lib/reader.js'), fstream.Reader)
assert.strictEqual(require('../lib/writer.js'), fstream.Writer)

try {
  require('@stackline/fstream/lib/traversal')
  assert.fail('private traversal helper must not resolve through package exports')
} catch (error) {
  assert.strictEqual(error.code, 'ERR_PACKAGE_PATH_NOT_EXPORTED')
}

var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-fstream-runtime-'))
var input = path.join(temporary, 'input.txt')
var output = path.join(temporary, 'output.txt')
fs.writeFileSync(input, 'runtime compatibility')

Promise.all([
  import('../index.mjs'),
  new Promise(function (resolve, reject) {
    var reader = fstream.Reader(input)
    var writer = fstream.Writer({ path: output, type: 'File' })
    reader.on('error', reject)
    writer.on('error', reject)
    writer.on('close', resolve)
    reader.pipe(writer)
  })
]).then(function (results) {
  assert.strictEqual(results[0].default, fstream)
  assert.strictEqual(results[0].Reader, fstream.Reader)
  assert.strictEqual(fs.readFileSync(output, 'utf8'), 'runtime compatibility')
  fs.rmSync(temporary, { force: true, recursive: true })
  console.log('Runtime compatibility passed on Node ' + process.versions.node + '.')
}, function (error) {
  fs.rmSync(temporary, { force: true, recursive: true })
  throw error
})
