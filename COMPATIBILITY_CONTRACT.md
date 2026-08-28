# Compatibility Contract

## Baseline

The compatibility baseline is the published `fstream@1.0.12` artifact. This
package preserves its observable filesystem stream API while correcting a
small set of bounded lifecycle and traversal defects.

The CommonJS root remains an object with exactly these enumerable keys, in
order:

1. `Abstract`
2. `Reader`
3. `Writer`
4. `File`
5. `Dir`
6. `Link`
7. `Proxy`
8. `DirReader`
9. `FileReader`
10. `LinkReader`
11. `ProxyReader`
12. `DirWriter`
13. `FileWriter`
14. `LinkWriter`
15. `ProxyWriter`
16. `collect`

`Reader` and `Writer` remain callable and newable factories. The identities of
`Reader.Dir`, `Reader.File`, `Reader.Link`, `Reader.Proxy`, `Writer.Dir`,
`Writer.File`, `Writer.Link`, and `Writer.Proxy` remain equal to their root
aliases and grouped `Dir`, `File`, `Link`, and `Proxy` members.

## Historical entry points

The root forms `@stackline/fstream`, `@stackline/fstream/fstream`,
`@stackline/fstream/fstream.js`, `@stackline/fstream/index`, and
`@stackline/fstream/index.js` resolve to the same API for CommonJS consumers.

All 14 runtime files historically shipped under `lib/` are export-mapped with
and without `.js`:

- `abstract`, `collect`, `dir-reader`, `dir-writer`, `file-reader`,
  `file-writer`, and `get-type`;
- `link-reader`, `link-writer`, `proxy-reader`, `proxy-writer`, `reader`,
  `socket-reader`, and `writer`.

New maintenance helpers such as native removal, directory creation, and
traversal state are private. They are not supported deep imports.

## Preserved behavior

- readers expose stat metadata and the historical `ready`, `stat`, `entries`,
  `entry`, recursive `child`, `warn`, `error`, `end`, and `close` event flow;
- explicit reader types begin unready and expose complete metadata before
  `ready` and entry listeners run;
- filters, alphabetical or callback sorting, pause/resume propagation,
  disowning, aborting, and legacy stream piping retain their semantics;
- symbolic links are not followed unless `follow: true` is supplied;
- multiply-linked files are represented as one byte-bearing `File` followed by
  `Link` entries when hard-link handling is enabled;
- byte counts are checked when `size` is supplied;
- writers create files, directories, symbolic links, and hard links, create
  missing parents, replace incompatible destinations, and preserve requested
  metadata where the platform and caller permissions allow it;
- string octal modes, file flags, link paths, filter callbacks, and directory
  reader-to-writer piping retain upstream behavior;
- errors retain the historical fstream path, type, class, link, and call-site
  decorations where applicable; and
- `collect()` retains buffered data and directory-entry replay behavior.

## Intentional corrections

### Follow propagation and cycles

`follow: true` now propagates to descendants. If following a link would revisit
an ancestor directory identity, the cyclic entry remains observable, emits one
`warn` with code `ELOOP`, and terminates that branch. Independent sibling
aliases of the same target may each be traversed because they are not ancestor
cycles.

### Traversal-local hard links

Hard-link identities belong to one root traversal. Concurrent and later roots
cannot affect one another, and completed traversals do not retain every inode
in process-global state. `Reader.hardLinks` remains present for shape
compatibility but is intentionally inert.

### Lifecycle and native helpers

The maintained implementation avoids deprecated `Buffer` construction,
preserves entry readiness for read-only paths, and prevents an error discovered
only after a successful close from becoming a second terminal outcome.
Legitimate errors observed before close still propagate. Native bounded
filesystem helpers replace obsolete transitive packages without becoming
public API.

### Backpressure and collection replay

The upstream `ProxyWriter` drain flag typo could either omit a required signal
or permit a duplicate or premature one. A buffered proxy now emits `drain` only
after its selected file or directory delegate can accept more work, including
directory `add()` delegation.

Calling `pipe()` without a destination on a collected stream now detaches the
entry collector before replay. The replay terminates and retains buffered
entry, data, and end order instead of collecting its own replayed entries.

## Additive surfaces

- an ESM default export identical to the CommonJS namespace;
- ESM named root exports and default deep-module facades;
- TypeScript 3.9-compatible CommonJS declarations and modern ESM declarations;
- conditional export maps for the root aliases and 14 historical deep entries;
  and
- package metadata for a Node.js 14.15.1 runtime floor.

## Runtime boundary

Supported runtimes are Node.js 14.15.1 and newer. Package development tools
require Node.js 20 or newer, but they are not installed in production. Node.js
versions below 14.15.1 and browser runtimes are outside this contract.

Filesystem capabilities vary by operating system, mount, ownership, and
privilege. In particular, symlink creation, hard links, `chown`, link metadata,
timestamps, and Windows long-path handling cannot be made identical on every
host. The contract preserves the upstream platform guards and tests supported
behavior on Unix and Windows; it does not promise unavailable host features.

## Non-contractual details

Private helper layout, development dependencies, test fixtures, exact stack
trace formatting, and the removed obsolete production dependency tree are not
compatibility surfaces. The package does not provide transactions, path
sandboxing, archive validation, or a browser filesystem abstraction.
