import { readdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))

// A prepared release candidate is immutable. Cleanup intentionally leaves it
// alone so a later verification run cannot erase or replace frozen bytes.
for (const directory of ['coverage', 'dist', 'esm']) {
  await rm(path.join(root, directory), { force: true, recursive: true })
}

for (const file of await readdir(root)) {
  if (file.endsWith('.tgz')) await rm(path.join(root, file), { force: true })
}

await rm(path.join(root, 'index.d.cts'), { force: true })
await rm(path.join(root, 'fstream.d.ts'), { force: true })
