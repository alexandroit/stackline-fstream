import assert from 'node:assert/strict'
import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const fstream = require('../fstream.js')
const expectedKeys = [
  'Abstract', 'Reader', 'Writer', 'File', 'Dir', 'Link', 'Proxy',
  'DirReader', 'FileReader', 'LinkReader', 'ProxyReader',
  'DirWriter', 'FileWriter', 'LinkWriter', 'ProxyWriter', 'collect'
]

assert.deepEqual(Object.keys(fstream), expectedKeys)

const libDirectory = path.join(root, 'lib')
const esmDirectory = path.join(root, 'esm', 'lib')
await mkdir(esmDirectory, { recursive: true })

const runtimeFiles = (await readdir(libDirectory))
  .filter((file) => file.endsWith('.js'))
  .sort()

for (const file of runtimeFiles) {
  const stem = file.slice(0, -3)
  await writeFile(path.join(esmDirectory, `${stem}.mjs`), [
    `import value from '../../lib/${file}'`,
    '',
    'export default value',
    ''
  ].join('\n'))

  await writeFile(path.join(esmDirectory, `${stem}.d.mts`), [
    `import value = require('../../lib/${file}')`,
    '',
    'export default value',
    ''
  ].join('\n'))
}

const publicTypes = {
  'abstract': 'typeof fstream.Abstract',
  'reader': 'typeof fstream.Reader',
  'writer': 'typeof fstream.Writer',
  'dir-reader': 'typeof fstream.DirReader',
  'file-reader': 'typeof fstream.FileReader',
  'link-reader': 'typeof fstream.LinkReader',
  'proxy-reader': 'typeof fstream.ProxyReader',
  'dir-writer': 'typeof fstream.DirWriter',
  'file-writer': 'typeof fstream.FileWriter',
  'link-writer': 'typeof fstream.LinkWriter',
  'proxy-writer': 'typeof fstream.ProxyWriter',
  'collect': 'typeof fstream.collect'
}

for (const [stem, type] of Object.entries(publicTypes)) {
  await writeFile(path.join(libDirectory, `${stem}.d.ts`), [
    "import fstream = require('../index.js')",
    '',
    `declare const value: ${type}`,
    'export = value',
    ''
  ].join('\n'))
}

await writeFile(path.join(libDirectory, 'socket-reader.d.ts'), [
  "import fstream = require('../index.js')",
  '',
  'declare const SocketReader: fstream.ReaderConstructor<fstream.SocketReader>',
  'export = SocketReader',
  ''
].join('\n'))

await writeFile(path.join(libDirectory, 'get-type.d.ts'), [
  "import { Stats } from 'fs'",
  "import fstream = require('../index.js')",
  '',
  'declare function getType(stat: fstream.EntryProperties | Stats): fstream.EntryType | null',
  'export = getType',
  ''
].join('\n'))

for (const stem of ['mkdir', 'remove', 'traversal']) {
  await writeFile(path.join(libDirectory, `${stem}.d.ts`), [
    'declare const internal: unknown',
    'export = internal',
    ''
  ].join('\n'))
}

await copyFile(path.join(root, 'index.d.ts'), path.join(root, 'index.d.cts'))
await copyFile(path.join(root, 'index.d.ts'), path.join(root, 'fstream.d.ts'))

console.log(`Built ${runtimeFiles.length} deep ESM and declaration facades.`)
