import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const changelog = await readFile(path.join(root, 'CHANGELOG.md'), 'utf8')
const escapedVersion = packageJson.version.replaceAll('.', '\\.')

assert.match(changelog,
  new RegExp(`^## ${escapedVersion} - \\d{4}-\\d{2}-\\d{2}$`, 'm'),
  'the current package version must have a dated changelog heading')
assert.doesNotMatch(changelog, /^## .* - Unreleased$/m)
assert.equal(packageJson.name, '@stackline/fstream')
assert.equal(packageJson.publishConfig.access, 'public')
assert.equal(packageJson.repository.url,
  'git+https://github.com/alexandroit/stackline-fstream.git')

console.log(`Release metadata passed for ${packageJson.name}@${packageJson.version}.`)
