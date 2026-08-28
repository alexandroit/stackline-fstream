'use strict'

var assert = require('assert')
var childProcess = require('child_process')
var fs = require('fs')
var path = require('path')
var helpers = require('./helpers.js')

var root = helpers.makeTemp('differential')
var fixture = path.join(root, 'fixture')
fs.mkdirSync(path.join(fixture, 'b'), { recursive: true })
fs.mkdirSync(path.join(fixture, 'a'))
fs.writeFileSync(path.join(fixture, 'b', 'two.txt'), 'two')
fs.writeFileSync(path.join(fixture, 'a', 'one.txt'), 'one')
fs.writeFileSync(path.join(fixture, '.ignored'), 'ignored')

function run (moduleId) {
  var result = childProcess.spawnSync(process.execPath, [
    path.join(__dirname, 'fixtures', 'differential-runner.js'),
    moduleId,
    fixture
  ], { encoding: 'utf8' })
  assert.strictEqual(result.status, 0, result.stdout + result.stderr)
  return JSON.parse(result.stdout)
}

try {
  var baseline = run('fstream-upstream')
  var current = run(path.resolve(__dirname, '..'))
  assert.deepStrictEqual(current, baseline)
  console.log('Differential Reader, event, export, alias, and deep-entry checks passed.')
} finally {
  fs.rmSync(root, { force: true, recursive: true })
}
