import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const inheritedNpmCli = process.env.npm_execpath
const useInheritedNpmCli = inheritedNpmCli && /npm-cli\.js$/iu.test(inheritedNpmCli)
const npmCommand = useInheritedNpmCli
  ? process.execPath
  : process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npmPrefix = useInheritedNpmCli ? [inheritedNpmCli] : []
const temporary = await mkdtemp(path.join(tmpdir(), 'stackline-fstream-closure-'))

function run (args, cwd, allowFailure = false) {
  const commandArgs = npmPrefix.concat(args)
  const result = spawnSync(npmCommand, commandArgs, {
    cwd,
    encoding: 'utf8',
    timeout: 180000,
    env: {
      ...process.env,
      CI: 'true',
      NPM_CONFIG_FUND: 'false',
      NPM_CONFIG_PROGRESS: 'false',
      NPM_CONFIG_UPDATE_NOTIFIER: 'false'
    }
  })
  if (!allowFailure) {
    const executionError = result.error ? `${result.error.stack || result.error}\n` : ''
    assert.equal(
      result.status,
      0,
      `${npmCommand} ${commandArgs.join(' ')}\n${executionError}${result.stdout || ''}\n${result.stderr || ''}`
    )
  }
  return result
}

function assertNoWarnings (result) {
  const output = `${result.stdout || ''}\n${result.stderr || ''}`
  assert.doesNotMatch(
    output,
    /npm\s+warn|npm\s+WARN|deprecated|ERESOLVE|EBADENGINE|EINTEGRITY/iu
  )
}

async function verifyConsumer (tarball, alias) {
  const directory = path.join(temporary, alias ? 'legacy-alias' : 'direct-scoped')
  const key = alias ? 'fstream' : '@stackline/fstream'
  await mkdir(directory)
  await writeFile(path.join(directory, 'package.json'), `${JSON.stringify({
    name: `fstream-${alias ? 'alias' : 'direct'}-closure`,
    private: true,
    version: '0.0.0',
    dependencies: { [key]: `file:${tarball}` }
  }, null, 2)}\n`)

  const install = run([
    'install', '--ignore-scripts', '--omit=dev', '--no-fund', '--no-progress',
    '--loglevel=warn'
  ], directory)
  assertNoWarnings(install)

  const tree = run(['ls', '--all', '--omit=dev', '--json'], directory)
  const parsedTree = JSON.parse(tree.stdout)
  assert.deepEqual(parsedTree.problems || [], [])

  const audit = run(['audit', '--omit=dev', '--audit-level=low', '--json'], directory, true)
  const parsedAudit = JSON.parse(audit.stdout || audit.stderr)
  assert.equal(parsedAudit.metadata.vulnerabilities.total, 0)
  assert.equal(audit.status, 0)

  const packagePath = key.startsWith('@')
    ? path.join(directory, 'node_modules', '@stackline', 'fstream', 'package.json')
    : path.join(directory, 'node_modules', 'fstream', 'package.json')
  const installed = JSON.parse(await readFile(packagePath, 'utf8'))
  assert.equal(installed.name, '@stackline/fstream')
  assert.equal(installed.version, '1.0.2')
  assert.deepEqual(installed.dependencies, {
    'graceful-fs': 'npm:@stackline/graceful-fs@1.0.0'
  })

  const graceful = JSON.parse(await readFile(
    path.join(directory, 'node_modules', 'graceful-fs', 'package.json'),
    'utf8'
  ))
  assert.equal(graceful.name, '@stackline/graceful-fs')
  assert.equal(graceful.version, '1.0.0')
  assert.deepEqual(graceful.dependencies || {}, {})

  const smoke = spawnSync(process.execPath, ['-e', `
    const fstream = require(${JSON.stringify(key)})
    if (!fstream || typeof fstream.Reader !== 'function' || typeof fstream.Writer !== 'function')
      throw new Error('invalid fstream public surface')
  `], { cwd: directory, encoding: 'utf8' })
  assert.equal(smoke.status, 0, smoke.stderr || smoke.stdout)

  const lock = JSON.parse(await readFile(path.join(directory, 'package-lock.json'), 'utf8'))
  const production = Object.entries(lock.packages)
    .filter(([location, node]) => location && node.dev !== true)
  assert.equal(production.length, 2)
}

try {
  const pack = run([
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', temporary
  ], root)
  const details = JSON.parse(pack.stdout.trim())[0]
  assert.equal(details.name, '@stackline/fstream')
  assert.equal(details.version, '1.0.2')
  const tarball = path.join(temporary, details.filename)

  await verifyConsumer(tarball, false)
  await verifyConsumer(tarball, true)
  process.stdout.write('direct and historical-key production closures are clean\n')
} finally {
  await rm(temporary, { recursive: true, force: true })
}
