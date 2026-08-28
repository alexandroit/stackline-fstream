'use strict'

const path = require('path')
const fstream = require('@stackline/fstream')

const target = path.resolve(process.argv[2] || '.')
const reader = fstream.Reader({ path: target, sort: 'alpha' })

reader.on('ready', function () {
  console.log('%s\t%s', reader.type, reader.path)
})

reader.on('child', function (entry) {
  console.log('%s\t%s', entry.type, path.relative(target, entry.path))
})

reader.on('warn', function (warning) {
  console.error('warning: %s', warning.message)
})

reader.on('error', function (error) {
  console.error(error)
  process.exitCode = 1
})
