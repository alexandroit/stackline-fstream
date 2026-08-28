'use strict'

var childProcess = require('child_process')
var EventEmitter = require('events').EventEmitter
var fs = require('fs')
var net = require('net')
var path = require('path')
var test = require('tape')
var gracefulFs = require('graceful-fs')
var fstream = require('..')
var SocketReader = require('../lib/socket-reader.js')
var helpers = require('./helpers.js')

test('typed readers expose false then true readiness before entries', function (t) {
  var root = helpers.makeTemp('typed-ready')
  fs.writeFileSync(path.join(root, 'first.txt'), 'first', { mode: 0o444 })
  var reader = fstream.Reader({ path: root, type: 'Directory' })
  var rootReady = false

  t.equal(reader.ready, false, 'typed root begins explicitly unready')
  reader.on('ready', function () {
    rootReady = true
    t.equal(reader.ready, true, 'ready is true before ready listeners run')
    t.equal(reader.props.mode > 0, true, 'root metadata exists before ready')
  })
  reader.on('entry', function (entry) {
    t.equal(rootReady, true, 'entry follows root ready')
    t.equal(entry.ready, true, 'entry is ready before entry listeners run')
  })
  reader.on('error', t.fail)
  reader.on('close', function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  })
})

test('follow propagates, sibling aliases remain independent, and cycles terminate', function (t) {
  if (process.platform === 'win32') {
    t.pass('symlink traversal is covered where the runner permits links')
    return t.end()
  }

  var root = helpers.makeTemp('follow')
  var target = path.join(root, 'target')
  fs.mkdirSync(target)
  fs.writeFileSync(path.join(target, 'value.txt'), 'value')
  fs.symlinkSync('target', path.join(root, 'alias-a'), 'dir')
  fs.symlinkSync('target', path.join(root, 'alias-b'), 'dir')
  fs.symlinkSync('..', path.join(target, 'back-to-root'), 'dir')

  helpers.readTree(fstream, { path: root, follow: true, sort: 'alpha' }).then(function (result) {
    var values = result.entries.filter(function (entry) {
      return /value\.txt$/.test(entry.path)
    }).map(function (entry) { return entry.path }).sort()
    var cycles = result.entries.filter(function (entry) {
      return /back-to-root$/.test(entry.path)
    })

    t.deepEqual(values, [
      'alias-a/value.txt',
      'alias-b/value.txt',
      'target/value.txt'
    ], 'non-ancestor aliases each traverse once')
    t.equal(cycles.length, 3, 'each cyclic branch remains an observable entry')
    t.equal(result.warnings.length, 3, 'each cyclic branch warns exactly once')
    t.equal(result.warnings.every(function (warning) {
      return warning.code === 'ELOOP'
    }), true)
    t.equal(result.entries.length, 9, 'root is not recursively revisited')
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('hard-link tracking is traversal-local and still preserves link entries', function (t) {
  if (process.platform === 'win32') {
    t.pass('hard-link traversal is covered on Unix runners')
    return t.end()
  }

  var root = helpers.makeTemp('hardlinks')
  var first = path.join(root, 'a.txt')
  var second = path.join(root, 'b.txt')
  fs.writeFileSync(first, 'same inode')
  fs.linkSync(first, second)

  Promise.all([
    helpers.readTree(fstream, { path: root, type: 'Directory', sort: 'alpha' }),
    helpers.readTree(fstream, { path: root, type: 'Directory', sort: 'alpha' })
  ]).then(function (results) {
    results.forEach(function (result) {
      var entries = result.entries.sort(function (a, b) { return a.path.localeCompare(b.path) })
      t.equal(entries[0].type, 'File')
      t.equal(entries[0].data, 'same inode')
      t.equal(entries[1].type, 'Link')
      t.equal(entries[1].linkpath, first)
    })
    return helpers.readFile(fstream, second)
  }).then(function (standalone) {
    t.equal(standalone.reader.type, 'File', 'a separate root traversal reads bytes')
    t.equal(standalone.data.toString(), 'same inode')
    t.deepEqual(Object.keys(fstream.Reader.hardLinks), [], 'legacy public table stays inert')
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('reusing one caller-owned options object creates independent roots', function (t) {
  if (process.platform === 'win32') {
    t.pass('hard-link ownership coverage runs on Unix')
    return t.end()
  }

  var root = helpers.makeTemp('reused-options')
  var first = path.join(root, 'a.txt')
  fs.writeFileSync(first, 'same inode')
  fs.linkSync(first, path.join(root, 'b.txt'))
  var options = { path: root, sort: 'alpha' }

  Promise.all([
    helpers.readTree(fstream, options),
    helpers.readTree(fstream, options)
  ]).then(function (results) {
    results.forEach(function (result) {
      t.deepEqual(result.entries.map(function (entry) { return entry.type }).sort(),
        ['File', 'Link'])
    })
    t.equal(Object.getOwnPropertyNames(options).some(function (key) {
      return /^_fstream/.test(key)
    }), false, 'private traversal ownership is not retained on caller options')
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('native clobbering replaces incompatible and multiply-linked targets', function (t) {
  var root = helpers.makeTemp('native-clobber')
  var target = path.join(root, 'target')
  fs.mkdirSync(target)
  fs.writeFileSync(path.join(target, 'old.txt'), 'old')

  helpers.writeFile(fstream, target, 'new').then(function () {
    t.equal(fs.readFileSync(target, 'utf8'), 'new', 'directory replaced by file')
    var linked = path.join(root, 'linked.txt')
    fs.linkSync(target, linked)
    return helpers.writeFile(fstream, target, 'detached')
  }).then(function () {
    t.equal(fs.readFileSync(target, 'utf8'), 'detached')
    t.equal(fs.readFileSync(path.join(root, 'linked.txt'), 'utf8'), 'new',
      'multiply-linked destination is unlinked before writing')
    var directory = fstream.Writer({ path: target, type: 'Directory' })
    return new Promise(function (resolve, reject) {
      directory.on('error', reject)
      directory.on('close', resolve)
      directory.end()
    })
  }).then(function () {
    t.equal(fs.statSync(target).isDirectory(), true, 'file replaced by directory')
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('implicit parents retain usable directory permissions', function (t) {
  if (process.platform === 'win32') {
    t.pass('mode assertions are not portable to Windows')
    return t.end()
  }

  var root = helpers.makeTemp('parent-mode')
  var first = path.join(root, 'nested', 'first.txt')
  var second = path.join(root, 'nested', 'second.txt')
  helpers.writeFile(fstream, first, 'first', { mode: 0o444 }).then(function () {
    var parentMode = fs.statSync(path.dirname(first)).mode & 0o777
    t.equal((parentMode & 0o300) === 0o300, true, 'implicit parent remains owner-writable/searchable')
    return helpers.writeFile(fstream, second, 'second', { mode: 0o444 })
  }).then(function () {
    t.equal(fs.readFileSync(second, 'utf8'), 'second')
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('numeric timestamps are converted independently', function (t) {
  if (process.platform === 'win32') {
    t.pass('upstream intentionally skips timestamp application on Windows')
    return t.end()
  }

  var root = helpers.makeTemp('timestamps')
  var target = path.join(root, 'file.txt')
  helpers.writeFile(fstream, target, 'time', { atime: 2000, mtime: 3000 }).then(function () {
    var stat = fs.statSync(target)
    t.equal(Math.abs(stat.atimeMs - 2000) < 1000, true)
    t.equal(Math.abs(stat.mtimeMs - 3000) < 1000, true)
  }).then(function () {
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('writer close is terminal and no filesystem work occurs afterward', function (t) {
  var root = helpers.makeTemp('terminal-close')
  var target = path.join(root, 'file.txt')
  var methods = ['chmod', 'chown', 'lchmod', 'lchown', 'lstat', 'lutimes', 'stat', 'utimes']
  var originals = {}
  var closed = false
  var afterClose = []

  methods.forEach(function (method) {
    if (typeof gracefulFs[method] !== 'function') return
    originals[method] = gracefulFs[method]
    gracefulFs[method] = function () {
      if (closed) afterClose.push(method)
      return originals[method].apply(this, arguments)
    }
  })

  var writer = fstream.Writer({ path: target, type: 'File' })
  var closeCount = 0
  writer.on('error', t.fail)
  writer.on('close', function () {
    closeCount++
    closed = true
    fs.rmSync(target, { force: true })
    writer.end()
    helpers.wait(50).then(function () {
      methods.forEach(function (method) {
        if (originals[method]) gracefulFs[method] = originals[method]
      })
      t.equal(closeCount, 1, 'close remains idempotent')
      t.deepEqual(afterClose, [], 'no metadata call starts after close')
      fs.rmSync(root, { force: true, recursive: true })
      t.end()
    })
  })
  writer.end('terminal')
})

test('collect does not trigger the deprecated Buffer constructor', function (t) {
  var script = [
    "const fstream = require('./')",
    "const { PassThrough } = require('stream')",
    'const stream = new PassThrough()',
    'fstream.collect(stream)',
    "stream.end('text')",
    'stream.pipe()'
  ].join(';')
  var result = childProcess.spawnSync(process.execPath, [
    '--pending-deprecation', '-e', script
  ], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' })
  t.equal(result.status, 0, result.stdout + result.stderr)
  t.equal(/DEP0005|Buffer\(\) is deprecated/.test(result.stderr), false)
  t.end()
})

test('proxy writers buffer calls, preserve existing types, and honor drain', function (t) {
  var root = helpers.makeTemp('proxy-writer')
  var fresh = path.join(root, 'fresh.txt')
  var existing = path.join(root, 'existing.txt')
  var source = path.join(root, 'source')
  var destination = path.join(root, 'destination')
  fs.writeFileSync(existing, 'old')
  fs.mkdirSync(source)
  fs.writeFileSync(path.join(source, 'source.txt'), 'copied through add')
  fs.mkdirSync(destination)

  function bufferedFile (target, contents) {
    return new Promise(function (resolve, reject) {
      var writer = fstream.Writer({ path: target })
      var drainCount = 0
      var proxyType = null
      writer.on('error', reject)
      writer.on('proxy', function (proxy) { proxyType = proxy.type })
      writer.on('drain', function () { drainCount++ })
      writer.on('close', function () {
        resolve({ drainCount: drainCount, proxyType: proxyType })
      })
      t.equal(writer.write(contents.slice(0, 4)), false,
        'write backpressures until async type selection')
      t.equal(writer.end(contents.slice(4)), false,
        'end is buffered until async type selection')
    })
  }

  bufferedFile(fresh, 'fresh content').then(function (result) {
    t.equal(result.proxyType, 'File', 'missing destination defaults to File')
    t.equal(result.drainCount, 1, 'buffered write emits one drain after delegation')
    t.equal(fs.readFileSync(fresh, 'utf8'), 'fresh content')
    return bufferedFile(existing, 'replacement')
  }).then(function (result) {
    t.equal(result.proxyType, 'File', 'existing destination retains its type')
    t.equal(result.drainCount, 1)
    t.equal(fs.readFileSync(existing, 'utf8'), 'replacement')

    return new Promise(function (resolve, reject) {
      var reader = fstream.Reader({ path: source, type: 'Directory' })
      reader.on('error', reject)
      reader.once('entry', function (entry) {
        var writer = fstream.Writer({ path: destination })
        var drains = 0
        writer.on('error', reject)
        writer.on('drain', function () { drains++ })
        writer.on('close', function () { resolve(drains) })
        t.equal(writer.add(entry), false,
          'add backpressures until an existing directory is selected')
        writer.end()
      })
    })
  }).then(function (drains) {
    t.equal(drains, 1, 'buffered add emits one proxy drain')
    t.equal(fs.readFileSync(path.join(destination, 'source.txt'), 'utf8'),
      'copied through add')
    fs.rmSync(root, { force: true, recursive: true })
    t.end()
  }, function (error) {
    fs.rmSync(root, { force: true, recursive: true })
    t.fail(error)
    t.end()
  })
})

test('collect replays legacy stream data, entries, and proxy pauses', function (t) {
  function LegacyStream (paused) {
    EventEmitter.call(this)
    this._paused = paused
    this.originalPipeCalls = 0
  }
  require('util').inherits(LegacyStream, EventEmitter)
  LegacyStream.prototype.pause = function () {
    this._paused = true
  }
  LegacyStream.prototype.resume = function () {
    this._paused = false
    this.emit('resume')
  }
  LegacyStream.prototype.pipe = function (destination) {
    this.originalPipeCalls++
    return destination
  }

  var stream = new LegacyStream(true)
  var entry = new LegacyStream(false)
  var proxy = new LegacyStream(false)
  var replay = []
  var added = []
  var destination = {
    add: function (value) {
      added.push(value)
      value.emit('end')
      return true
    }
  }

  fstream.collect(stream)
  t.equal(stream._collected, undefined, 'collection waits for a paused stream')
  stream.resume()
  t.equal(stream._collected, true, 'resume installs collection exactly once')
  fstream.collect(stream)

  stream.emit('data', 'text')
  stream.emit('data', Buffer.alloc(0))
  stream.emit('entry', entry)
  stream.emit('proxy', proxy)
  stream.emit('end')
  stream.on('data', function (chunk) { replay.push(chunk.toString()) })
  stream.on('end', function () { replay.push('end') })

  t.equal(proxy._paused, true, 'newly selected proxies are paused while collected')
  t.equal(stream.pipe(destination), destination)
  t.deepEqual(added, [entry], 'buffered entries are replayed through destination.add')
  t.deepEqual(replay, ['text', 'end'], 'buffered data and terminal event replay in order')
  t.equal(stream.originalPipeCalls, 1, 'the original pipe implementation is restored')
  t.equal(stream._paused, false, 'the source resumes after replay')

  var replayOnly = new LegacyStream(false)
  var replayEntry = new LegacyStream(false)
  var observedEntries = []
  fstream.collect(replayOnly)
  replayOnly.emit('entry', replayEntry)
  replayOnly.on('entry', function (value) { observedEntries.push(value) })
  t.equal(replayOnly.pipe(), undefined, 'pipe without a destination replays events')
  t.deepEqual(observedEntries, [replayEntry], 'entry replay does not require a writer')
  replayEntry.emit('end')
  t.equal(replayOnly._paused, false, 'replay-only collection resumes after its entry')
  t.end()
})

test('directory readers report sockets without treating them as pipeable entries', function (t) {
  if (process.platform === 'win32') {
    t.pass('Unix-domain socket coverage runs on Unix platforms')
    return t.end()
  }

  var root = helpers.makeTemp('socket-reader')
  var socketPath = path.join(root, 'service.sock')
  var server = net.createServer()
  server.on('error', finishWithError)
  server.listen(socketPath, function () {
    var reader = fstream.Reader({ path: root, type: 'Directory' })
    var entries = 0
    var sockets = []
    reader.on('entry', function () { entries++ })
    reader.on('socket', function (socket) {
      sockets.push(socket)
      t.ok(socket instanceof SocketReader)
      t.equal(socket.type, 'Socket')
      t.equal(socket.ready, true)
    })
    reader.on('error', finishWithError)
    reader.on('close', function () {
      t.equal(entries, 0, 'socket is excluded from ordinary entry events')
      t.equal(sockets.length, 1, 'socket event remains observable')
      server.close(function () {
        fs.rmSync(root, { force: true, recursive: true })
        t.end()
      })
    })
  })

  function finishWithError (error) {
    server.close(function () {
      fs.rmSync(root, { force: true, recursive: true })
      t.fail(error)
      t.end()
    })
  }
})
