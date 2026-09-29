# @stackline/fstream

> Compatibility-first filesystem object streams with maintained packaging and first-party types.

[![npm version](https://img.shields.io/npm/v/@stackline/fstream.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/fstream)
[![license](https://img.shields.io/npm/l/@stackline/fstream.svg?style=flat-square)](https://github.com/alexandroit/stackline-fstream)
[![GitHub repository](https://img.shields.io/badge/GitHub-repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-fstream)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/vanilla/fstream/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/vanilla/fstream/)** | **[npm](https://www.npmjs.com/package/@stackline/fstream)** | **[Issues](https://github.com/alexandroit/stackline-fstream/issues)** | **[Repository](https://github.com/alexandroit/stackline-fstream)**

**Current package version:** `1.0.5`

---

## Why this package?

A compatibility-first maintained continuation of
[`fstream@1.0.12`](https://www.npmjs.com/package/fstream). It provides
stat-bearing filesystem object streams for files, directories, symbolic links,
and directory trees.

This project is independent. It is not affiliated with or endorsed by Isaac
Z. Schlueter, the npm organization, or the upstream project.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/fstream@1.0.5` |
| Node.js runtime | `>=14.15.1` |
| CommonJS / primary entry | `./fstream.js` |
| ES module entry | `./index.mjs` |
| Type declarations | `./index.d.ts` |

<a id="compatibility-target"></a>

### Compatibility target

- the complete `fstream@1.0.12` CommonJS namespace, constructor aliases,
  events, metadata, filters, sorting, hard-link representation, and writers;
- all 14 historical runtime files under `lib/`, with and without `.js`;
- Node.js 14.15.1 or newer;
- additive ESM entry points and TypeScript 3.9-compatible declarations;
- deterministic termination when `follow: true` encounters an ancestor
  symbolic-link cycle; and
- traversal-local hard-link tracking without process-wide retained inode state.

This is a Node.js filesystem package. It has no browser contract or browser
build.

## Installation

<a id="install"></a>

### Install

```sh
npm install @stackline/fstream
```

To retain an existing dependency key and unchanged CommonJS imports, use an
npm alias:

## Usage

```sh
npm install fstream@npm:@stackline/fstream
```

```js
const fstream = require('fstream')
```

<a id="commonjs"></a>

### CommonJS

Copy a file or directory tree while retaining supported metadata:

```js
const fstream = require('@stackline/fstream')

const reader = fstream.Reader({ path: 'source', sort: 'alpha' })
const writer = fstream.Writer('destination')

reader.on('error', (error) => console.error(error))
writer.on('error', (error) => console.error(error))
reader.pipe(writer)
```

Create a file with explicit metadata:

```js
const writer = fstream.Writer({
  path: 'output.txt',
  type: 'File',
  mode: 0o644,
  size: 6
})

writer.on('error', (error) => console.error(error))
writer.end('hello\n')
```

<a id="esm"></a>

### ESM

The default export is the CommonJS namespace object. Every root member also
has a named export.

```js
import fstream, { Reader, Writer } from '@stackline/fstream'

const reader = Reader('source')
reader.pipe(Writer('destination'))

console.log(reader instanceof fstream.Abstract)
```

Runnable read-only examples are available in
[`examples/commonjs.cjs`](https://github.com/alexandroit/stackline-fstream/blob/main/examples/commonjs.cjs) and
[`examples/esm.mjs`](https://github.com/alexandroit/stackline-fstream/blob/main/examples/esm.mjs).

## Features and Integrations

<a id="common-options"></a>

### Common options

- `path` is required.
- `type` or a historical type flag selects a reader or writer implementation.
- `filter(entry, stat)` includes or excludes entries.
- `sort: 'alpha'` or a comparator orders directory entries.
- `follow: true` follows symbolic links while preventing ancestor cycles.
- `hardlinks: false` disables hard-link representation.
- `size` checks the expected byte count.
- `mode`, `uid`, `gid`, `atime`, and `mtime` request filesystem metadata.
- `flags`, `linkpath`, and `clobber` control applicable writers.

See [COMPATIBILITY_CONTRACT.md](https://github.com/alexandroit/stackline-fstream/blob/main/COMPATIBILITY_CONTRACT.md) for the precise
preserved and intentionally changed surfaces, and [MIGRATION.md](https://github.com/alexandroit/stackline-fstream/blob/main/MIGRATION.md)
for an adoption checklist.

<a id="typescript-prerequisite"></a>

### TypeScript prerequisite

The declarations use Node.js filesystem, stream, and buffer types. TypeScript
consumers must provide compatible Node declarations:

```sh
npm install --save-dev @types/node
```

The TypeScript 3.9 gate uses `@types/node@14.18.63` specifically. Newer
TypeScript versions may use newer Node declaration releases. `@types/node` is
an optional peer so JavaScript-only production installs do not receive a type
package they cannot use.

## Security

<a id="filesystem-and-security-boundary"></a>

### Filesystem and security boundary

`Writer` can replace paths and apply metadata, and `follow: true` traverses
symbolic links. Validate untrusted paths, constrain destination roots, and use
filters appropriate to the caller's trust model. Cycle prevention is a
termination guarantee, not a filesystem sandbox. See
[SECURITY.md](https://github.com/alexandroit/stackline-fstream/blob/main/SECURITY.md).

## API Surface

<a id="api"></a>

### API

#### `fstream.Reader(pathOrOptions[, currentStat])`

Callable with or without `new`. It returns the appropriate file, directory,
link, socket, or proxy reader. A reader exposes filesystem metadata on
`reader.props` and convenience fields such as `path`, `type`, `size`,
`basename`, and `dirname`.

Directory readers emit `entry` for each direct entry and `child` for every
recursive descendant. Relevant lifecycle events include `stat`, `ready`,
`entries`, `entry`, `child`, `warn`, `error`, `end`, and `close`. Readers retain
the historical `pause()`, `resume()`, `abort()`, and `pipe()` behavior.

#### `fstream.Writer(pathOrOptions[, currentStat])`

Callable with or without `new`. Writers create files, directories, and links,
apply requested metadata where the host permits it, and accept readers piped
from a directory tree. An incompatible existing destination is replaced by
default; set `clobber: false` when the historical implementation supports
rejecting that replacement for the selected writer path.

Always attach an `error` listener before writing. Filesystem changes are not
transactional.

#### `fstream.collect(stream)`

Pauses and buffers a reader, including directory entries, until its replacement
`pipe()` method is called. This legacy helper is preserved for consumers that
stage entries before choosing a destination.

#### Constructors and aliases

The namespace exports `Abstract`, `Reader`, `Writer`, grouped `File`, `Dir`,
`Link`, and `Proxy` constructors, the historical `DirReader`, `FileReader`,
`LinkReader`, `ProxyReader`, `DirWriter`, `FileWriter`, `LinkWriter`, and
`ProxyWriter` aliases, and `collect`.

The supported deep imports are `abstract`, `collect`, `dir-reader`,
`dir-writer`, `file-reader`, `file-writer`, `get-type`, `link-reader`,
`link-writer`, `proxy-reader`, `proxy-writer`, `reader`, `socket-reader`, and
`writer` beneath `@stackline/fstream/lib/`. Both extensionless and `.js`
forms are export-mapped.

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-fstream.git
cd stackline-fstream
npm ci
npm run verify
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:smoke
```

## Release Checklist

Run `npm run verify` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-fstream/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## License

ISC. Upstream copyright and attribution are retained in [LICENSE](https://github.com/alexandroit/stackline-fstream/blob/main/LICENSE),
[NOTICE](https://github.com/alexandroit/stackline-fstream/blob/main/NOTICE), and [THIRD_PARTY_LICENSES.md](https://github.com/alexandroit/stackline-fstream/blob/main/THIRD_PARTY_LICENSES.md).

## Credits and original authors

- Stackline Maintainers.
- Isaac Z. Schlueter and fstream contributors.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
