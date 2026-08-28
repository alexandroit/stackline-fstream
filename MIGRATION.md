# Migration

## From `fstream@1.0.12`

First confirm that every deployed runtime is Node.js 14.15.1 or newer. The
lowest-change migration then keeps the existing dependency key:

```sh
npm install fstream@npm:@stackline/fstream
```

Existing CommonJS source can remain unchanged:

```js
const fstream = require('fstream')
```

Commit the resulting manifest and lockfile changes, perform a clean install,
and run the consumer's filesystem integration tests.

To adopt the scoped name explicitly:

```diff
-const fstream = require('fstream')
+const fstream = require('@stackline/fstream')
```

Update historical deep imports in the same way. The 14 upstream `lib/` files
are available in both extensionless and `.js` forms.

## Behavior changes to exercise

The public API is preserved, but consumers should explicitly test these
intentional corrections:

1. Nested `follow: true` now follows descendant links. Ancestor cycles emit an
   `ELOOP` warning and end that branch rather than recursing indefinitely.
2. `Reader.hardLinks` remains present but no longer accumulates process-global
   inode records. Hard-link representation is traversal-local.
3. Read-only entries complete their metadata/readiness ordering consistently.
4. A successful close is terminal; a later cleanup observation cannot become a
   second error. Errors detected before close remain observable.
5. Native directory and removal helpers replace the old `mkdirp` and `rimraf`
   dependency paths. These helpers are private and must not be deep-imported.
6. Buffered proxy writers now emit `drain` only when their selected delegate
   can accept more work, and destinationless `collect().pipe()` replay now
   terminates after preserving entry/data/end order.

Test symlink aliases and cycles, multiply-linked files, filters, event order,
file size failures, read-only files, destination replacement, timestamps,
permissions, and immediate destination cleanup after close. Run those checks
on every operating system the consumer supports.

## ESM

ESM consumers may use the default namespace or named exports:

```js
import fstream, { Reader, Writer, collect } from '@stackline/fstream'
```

Historical deep modules have default ESM exports:

```js
import Reader from '@stackline/fstream/lib/reader.js'
```

There is no browser build or browser export condition.

## TypeScript

Install `@types/node` as a development dependency when the consumer does not
already provide Node.js declarations. The TypeScript 3.9 compatibility gate
uses `@types/node@14.18.63`; newer Node declaration versions can require newer
TypeScript syntax. It is an optional peer because runtime JavaScript consumers
do not need TypeScript packages.

CommonJS projects can use `import = require`:

```ts
import fstream = require('@stackline/fstream')

const reader = fstream.Reader({ path: 'input', sort: 'alpha' })
```

Modern ESM projects may import the default namespace and named values. The
declarations are tested with TypeScript 3.9 and current TypeScript. Because
upstream shipped no declarations, existing local shims should be removed or
reviewed so that they do not shadow the package types.

## Consumers older than `1.0.12`

The compatibility baseline is `1.0.12`, the first upstream release not affected
by [GHSA-xf7w-r453-m56c](https://github.com/advisories/GHSA-xf7w-r453-m56c).
Consumers on an earlier release should first compare their relied-on behavior
with upstream `1.0.12`; this package does not promise a byte-for-byte emulation
of earlier vulnerable releases.

## Rollback

Restore the previous dependency specification and lockfile, reinstall cleanly,
and rerun the same integration tests. The package owns no persistent migration
state. However, writer operations mutate the caller's filesystem and rollback
of the dependency does not undo files, links, ownership, modes, or timestamps;
use the caller's normal backup or transactional boundary for those changes.
