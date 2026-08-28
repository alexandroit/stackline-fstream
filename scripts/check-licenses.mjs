import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'))
const upstreamLicense = await readFile(path.join(root, 'LICENSE'), 'utf8')
const notices = await readFile(path.join(root, 'THIRD_PARTY_LICENSES.md'), 'utf8')
const gracefulPackage = JSON.parse(await readFile(path.join(
  root, 'node_modules', 'graceful-fs', 'package.json'
), 'utf8'))
const gracefulLicense = await readFile(path.join(
  root, 'node_modules', 'graceful-fs', 'LICENSE'
), 'utf8')

assert.deepEqual(packageJson.dependencies, { 'graceful-fs': '4.2.11' })
assert.equal(gracefulPackage.version, '4.2.11')
assert.equal(gracefulPackage.license, 'ISC')
assert.match(upstreamLicense, /Isaac Z\. Schlueter and Contributors/)
assert.match(gracefulLicense, /Isaac Z\. Schlueter, Ben Noordhuis/)
assert.match(notices, /`graceful-fs`\s*\|\s*4\.2\.11/)
assert.match(notices, /ISC/)

const productionPackages = Object.entries(lock.packages)
  .filter(([location, metadata]) => location && !metadata.dev)
  .map(([location]) => location)
assert.deepEqual(productionPackages, ['node_modules/graceful-fs'])

console.log('Production license inventory passed: fstream ISC; graceful-fs@4.2.11 ISC.')
