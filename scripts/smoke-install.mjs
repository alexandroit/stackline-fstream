import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-fstream-smoke-'))
const consumer = path.join(temporary, 'consumer')

function run(command, arguments_, options = {}) {
  return execFileSync(command, arguments_, {
    cwd: options.cwd || root,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: options.stdio || ['ignore', 'pipe', 'pipe']
  })
}

try {
  await mkdir(consumer)
  const packOutput = run(npm, [
    'pack', '--silent', '--json', '--pack-destination', temporary
  ]).trim()
  const jsonStart = packOutput.lastIndexOf('\n[')
  const packed = JSON.parse(jsonStart === -1 ? packOutput : packOutput.slice(jsonStart + 1))
  assert.equal(packed.length, 1)
  const archive = packed[0].filename

  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'fstream-packed-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@stackline/fstream': `file:../${archive}`,
      fstream: `file:../${archive}`
    }
  }, null, 2) + '\n')

  run(npm, [
    'install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund'
  ], { cwd: consumer })

  await writeFile(path.join(consumer, 'commonjs.cjs'), `
const assert = require('node:assert/strict')
const scoped = require('@stackline/fstream')
const legacy = require('fstream')
const Reader = require('@stackline/fstream/lib/reader')
const ReaderJs = require('@stackline/fstream/lib/reader.js')
const Writer = require('@stackline/fstream/lib/writer')
const LegacyReader = require('fstream/lib/reader')
assert.deepEqual(Object.keys(scoped), [
  'Abstract', 'Reader', 'Writer', 'File', 'Dir', 'Link', 'Proxy',
  'DirReader', 'FileReader', 'LinkReader', 'ProxyReader',
  'DirWriter', 'FileWriter', 'LinkWriter', 'ProxyWriter', 'collect'
])
assert.equal(Reader, scoped.Reader)
assert.equal(ReaderJs, scoped.Reader)
assert.equal(Writer, scoped.Writer)
assert.equal(LegacyReader, legacy.Reader)
assert.equal(require('@stackline/fstream/fstream'), scoped)
assert.equal(require('@stackline/fstream/fstream.js'), scoped)
assert.throws(
  () => require('@stackline/fstream/lib/traversal'),
  error => error && error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'
)
console.log('packed CommonJS and legacy alias passed')
`)

  await writeFile(path.join(consumer, 'module.mjs'), `
import assert from 'node:assert/strict'
import fstream, { Reader, Writer, collect } from '@stackline/fstream'
import DeepReader from '@stackline/fstream/lib/reader'
import DeepReaderJs from '@stackline/fstream/lib/reader.js'
import DeepWriter from '@stackline/fstream/lib/writer'
assert.equal(Reader, fstream.Reader)
assert.equal(Writer, fstream.Writer)
assert.equal(collect, fstream.collect)
assert.equal(DeepReader, Reader)
assert.equal(DeepReaderJs, Reader)
assert.equal(DeepWriter, Writer)
console.log('packed ESM and deep facades passed')
`)

  run(process.execPath, ['commonjs.cjs'], { cwd: consumer, stdio: 'inherit' })
  run(process.execPath, ['module.mjs'], { cwd: consumer, stdio: 'inherit' })

  await writeFile(path.join(consumer, 'types.ts'), `
import fstream = require('@stackline/fstream')
import Reader = require('@stackline/fstream/lib/reader.js')
const reader: fstream.Reader = new Reader('/tmp/input')
const writer: fstream.Writer = new fstream.Writer('/tmp/output')
reader.pipe(writer)
`)
  await writeFile(path.join(consumer, 'types.mts'), `
import fstream, { Reader, type ReaderOptions } from '@stackline/fstream'
import DeepReader from '@stackline/fstream/lib/reader'
const options: ReaderOptions = { path: '/tmp/input' }
const reader = new Reader(options)
DeepReader('/tmp/input')
fstream.collect(reader)
`)
  // Install the optional type peer explicitly in this clean consumer instead
  // of borrowing declarations from the package workspace.
  run(npm, [
    'install', '--save-dev', '--ignore-scripts', '--no-audit', '--no-fund',
    '@types/node@14.18.63'
  ], { cwd: consumer })
  await writeFile(path.join(consumer, 'tsconfig.legacy.json'), JSON.stringify({
    compilerOptions: {
      module: 'commonjs',
      noEmit: true,
      strict: true,
      target: 'es5',
      types: []
    },
    files: ['types.ts']
  }, null, 2) + '\n')
  await writeFile(path.join(consumer, 'tsconfig.modern.json'), JSON.stringify({
    compilerOptions: {
      lib: ['es2022', 'es2021.intl'],
      module: 'nodenext',
      moduleResolution: 'nodenext',
      noEmit: true,
      strict: true,
      target: 'es2022',
      types: []
    },
    files: ['types.ts', 'types.mts']
  }, null, 2) + '\n')

  run(process.execPath, [
    path.join(root, 'node_modules', 'typescript-3-9', 'bin', 'tsc'),
    '-p', 'tsconfig.legacy.json'
  ], { cwd: consumer })
  run(process.execPath, [
    path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
    '-p', 'tsconfig.modern.json'
  ], { cwd: consumer })

  const installed = JSON.parse(await readFile(path.join(
    consumer, 'node_modules', '@stackline', 'fstream', 'package.json'
  ), 'utf8'))
  assert.deepEqual(installed.dependencies, { 'graceful-fs': '4.2.11' })
  const tree = JSON.parse(run(npm, [
    'ls', '--omit=dev', '--all', '--json'
  ], { cwd: consumer }))
  assert.equal(tree.problems, undefined)
  console.log('Packed scoped, legacy-alias, ESM, deep-entry, and type consumers passed.')
} finally {
  await rm(temporary, { force: true, recursive: true })
}
