import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  access,
  copyFile,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const destination = path.join(root, 'release-candidate')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(arguments_, cwd = root) {
  return execFileSync(npm, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

function command(command_, arguments_) {
  return execFileSync(command_, arguments_, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

function digest(algorithm, buffer, encoding = 'hex') {
  return createHash(algorithm).update(buffer).digest(encoding)
}

async function pack(directory) {
  const output = run([
    'pack', '--silent', '--json', '--ignore-scripts',
    '--pack-destination', directory
  ]).trim()
  const jsonStart = output.lastIndexOf('\n[')
  const result = JSON.parse(jsonStart === -1 ? output : output.slice(jsonStart + 1))
  assert.equal(result.length, 1)
  const archive = path.join(directory, result[0].filename)
  return { details: result[0], archive, bytes: await readFile(archive) }
}

try {
  await access(destination)
  throw new Error(`release candidate already exists: ${destination}`)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

execFileSync(npm, ['run', 'verify'], {
  cwd: root,
  env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
  stdio: 'inherit'
})
assert.equal(command('git', ['status', '--porcelain', '--untracked-files=normal']), '',
  'release source must be committed and the worktree must be clean')
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const expectedTag = `stackline-v${packageJson.version}`
const tagsAtHead = command('git', ['tag', '--points-at', 'HEAD']).split('\n')
assert(tagsAtHead.includes(expectedTag),
  `${expectedTag} must point at the frozen source commit`)

// Build every release asset beside the final location, then atomically rename
// the complete directory. A failed preparation cannot leave a partial final
// candidate, and an existing final directory is never replaced.
let staging = await mkdtemp(path.join(root, '.release-candidate-staging-'))

try {
  const first = await pack(staging)
  const sha1 = digest('sha1', first.bytes)
  const sha256 = digest('sha256', first.bytes)
  const sha512 = digest('sha512', first.bytes)
  assert.equal(first.details.shasum, sha1)
  assert.equal(first.details.integrity,
    `sha512-${digest('sha512', first.bytes, 'base64')}`)
  assert.equal(first.details.entryCount, first.details.files.length)

  const manifest = {
    schema: 'stackline-release-artifact-v1',
    package: `${first.details.name}@${first.details.version}`,
    filename: first.details.filename,
    sha1,
    sha256,
    sha512,
    integrity: first.details.integrity,
    packedSize: first.details.size,
    unpackedSize: first.details.unpackedSize,
    entryCount: first.details.entryCount,
    sourceCommit: command('git', ['rev-parse', 'HEAD']),
    builder: {
      node: process.version,
      npm: command(npm, ['--version']),
      platform: `${process.platform}-${process.arch}`,
      environment: 'local-stackline-release-gate'
    },
    files: first.details.files.map(({ path: file, size, mode }) => ({ file, size, mode }))
  }
  await writeFile(path.join(staging, 'artifact-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n')
  await writeFile(path.join(staging, 'inventory.json'),
    JSON.stringify({ package: manifest.package, files: manifest.files }, null, 2) + '\n')
  await writeFile(path.join(staging, 'SHA1SUMS'),
    `${sha1}  ${first.details.filename}\n`)
  await writeFile(path.join(staging, 'SHA256SUMS'),
    `${sha256}  ${first.details.filename}\n`)
  await writeFile(path.join(staging, 'SHA512SUMS'),
    `${sha512}  ${first.details.filename}\n`)

  const licenses = {
    package: { name: '@stackline/fstream', license: 'ISC', file: 'LICENSE' },
    productionDependencies: [
      { name: 'graceful-fs', version: '4.2.11', license: 'ISC' }
    ],
    notices: ['NOTICE', 'THIRD_PARTY_LICENSES.md']
  }
  await writeFile(path.join(staging, 'licenses.json'),
    JSON.stringify(licenses, null, 2) + '\n')
  await copyFile(path.join(root, 'CHANGELOG.md'),
    path.join(staging, 'RELEASE_NOTES.md'))

  // npm's omit traversal can misclassify a production edge when the source
  // development graph also reaches that package. Generate the SBOM from an
  // isolated production install of the exact frozen tarball instead.
  const sbomConsumer = await mkdtemp(path.join(staging, '.sbom-consumer-'))
  await writeFile(path.join(sbomConsumer, 'package.json'), JSON.stringify({
    name: 'stackline-fstream-sbom-consumer',
    private: true,
    version: '1.0.0'
  }, null, 2) + '\n')
  run([
    'install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund',
    first.archive
  ], sbomConsumer)
  const sbom = run([
    'sbom', '--omit=dev', '--sbom-format', 'cyclonedx'
  ], sbomConsumer)
  const parsedSbom = JSON.parse(sbom)
  const components = [
    parsedSbom.metadata && parsedSbom.metadata.component,
    ...(parsedSbom.components || [])
  ].filter(Boolean)
  const rootComponent = components.find(({ name, version }) =>
    name === '@stackline/fstream' && version === '1.0.0')
  const gracefulComponent = components.find(({ name, version }) =>
    name === 'graceful-fs' && version === '4.2.11')
  assert(rootComponent, 'SBOM must contain @stackline/fstream@1.0.0')
  assert(gracefulComponent, 'SBOM must contain graceful-fs@4.2.11')
  const rootEdge = (parsedSbom.dependencies || []).find(({ ref }) =>
    ref === rootComponent['bom-ref'])
  assert(rootEdge && rootEdge.dependsOn.includes(gracefulComponent['bom-ref']),
    'SBOM must link @stackline/fstream to graceful-fs')
  await writeFile(path.join(staging, 'sbom.cdx.json'), sbom)
  await rm(sbomConsumer, { force: true, recursive: true })

  await rename(staging, destination)
  staging = null
  console.log(`Prepared immutable ${first.details.filename} (${sha256}).`)
} finally {
  if (staging) await rm(staging, { force: true, recursive: true })
}
