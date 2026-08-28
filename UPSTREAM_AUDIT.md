# Upstream Audit and Intake Decision

Observation date: 2026-08-28 (primary-source checks completed between
04:02Z and 04:22Z).

## Identity and immutable source

- npm package: `fstream@1.0.12`
- canonical repository: https://github.com/npm/fstream
- release commit: `42354590e23bb514eb5c869eea64406be2947c6c`
- latest repository commit:
  `bffea43c6a201c76bc85842539e09a779508790b` (dependency-range-only,
  2021-06-01)
- publication: 2019-05-15T00:38:18.821Z
- npm artifact SHA-1: `4e8ba8ee2d48be4f7d0de505455548eae5932045`
- npm artifact SHA-256:
  `7397e7e550f38bf60657067af1d7e70d504ea81375e7cf519dcf617e283b7564`
- npm integrity:
  `sha512-WvJ193OHa0GHPEL+AycEJgxvBEwyfRkN1vhjca23OaPVMCaLCXTd5qAu82AjTcgP1UJmytkOKb63Ypde7raDIg==`
- artifact inventory: 23 files
- license: ISC, Copyright (c) Isaac Z. Schlueter and Contributors
- current npm write maintainers: `saquibkhan`, `npm-cli-ops`, `reggi`

The package is explicitly deprecated as unsupported and the canonical
repository is archived. The release artifact, packument, current npm access,
tag, repository history, open issues and pull requests, advisory records,
alternatives, forks, dependencies and direct downstream source use were
checked. The proposed `@stackline/fstream` name, Verdaccio package, public
`alexandroit/stackline-fstream` repository and production documentation route
did not exist when checked.

Primary records:

- https://registry.npmjs.org/fstream/1.0.12
- https://registry.npmjs.org/fstream/-/fstream-1.0.12.tgz
- https://api.npmjs.org/downloads/point/2026-08-21:2026-08-27/fstream
- https://github.com/npm/fstream/tree/v1.0.12
- https://github.com/npm/fstream/issues
- https://github.com/npm/fstream/pulls
- https://github.com/advisories/GHSA-xf7w-r453-m56c

## Published compatibility surface

The root is a CommonJS namespace exposing callable/newable `Reader` and
`Writer` factories, `Abstract`, `collect`, grouped `File`, `Dir`, `Link` and
`Proxy` reader/writer constructors, and historical aliases such as
`FileReader`, `DirWriter`, `Reader.File` and `Writer.Proxy`. Every file under
`lib/` is also a reachable deep entry because the package has no export map.

Readers surface stat metadata, directory `entry`/recursive `child` events,
filters, alphabetical sorting, pause/resume/disown/abort behavior, symbolic
link following, hard-link representation, byte-count checks and legacy stream
semantics. Writers create files, directories and links; preserve requested
mode, ownership and timestamps where supported; clobber incompatible targets;
and accept streamed directory entries. There is no real browser contract or
published TypeScript declaration to preserve.

The exact upstream test command passes on the current runtime: four TAP example
suites, including 24 explicit assertions. The test harness itself resolves a
large obsolete development tree and is not adequate as a release gate, so its
observable behavior must be retained in a modern isolated suite.

## Maintenance, correctness and advisory assessment

The latest clean production install resolves `graceful-fs@4.2.11`,
`inherits@2.0.4`, `mkdirp@0.5.6` and `rimraf@2.7.1` and reports zero official
npm production advisories. The published `rimraf` path nevertheless adds the
retired `glob@7`/`inflight` tree, and both `mkdirp@0.5` and `rimraf@2` are
unsupported. The replacement must not claim that a clean `fstream@1.0.12`
install is currently vulnerable. GitHub advisory GHSA-xf7w-r453-m56c affects
versions below 1.0.12; 1.0.12 is the first patched version.

Fresh characterization reproduced several current correctness and lifecycle
gaps:

- directory children do not inherit `follow: true` because child props read an
  unset instance property; blindly applying the abandoned propagation patch
  permits unbounded traversal of symbolic-link cycles;
- the module-global hard-link table retains an entry for every distinct
  multiply-linked inode across completed, unrelated traversals;
- the deprecated `Buffer` constructor is reached through `collect`;
- a current `node-unzip-2` extraction path can observe an error after its
  documented close handling when the output is removed immediately;
- the read-only-file ordering reported in issue 28 remains reproducible in its
  explicit directory-reader/tar path.

All eight abandoned patch branches were reviewed rather than merged wholesale.
The mkdirp modernization branch calls the modern API with the legacy callback
shape and fails. The hard-link-removal branch destroys preservation behavior.
The follow-propagation branch needs cycle detection. The narrow Buffer update
is directionally correct but insufficient on its own. Open issue 70, issues
14/28/57/58/60/69 and the related open pull requests establish concrete tests;
they are not assumed correct merely because they exist.

## Reach, direct use and successor landscape

Official npm recorded **13,397,662 downloads** for the complete UTC week
2026-08-21 through 2026-08-27, observed 2026-08-28. This is a mutable reach
signal, not proof of direct use.

Current source inspection independently proves direct runtime use. In
`webos-tools/cli` (pushed 2026-06-29), `package.json` directly declares exact
`fstream@1.0.12`; `lib/package.js` calls the Reader/Writer API and
`lib/tar-filter-pack.js` calls `collect`. The active project requires Node
`>=14.15.1`, which is compatible with a maintained Node 14 baseline. Additional
declarations were rejected when they were overrides, lockfiles, unused
manifest entries or incompatible old-Node contracts rather than actual use.

No healthy maintained drop-in replacement was found. Modern `tar`,
`minipass`, native `fs` streams and extraction libraries are reasonable
caller migrations but do not preserve directory-entry streams, stat-bearing
reader objects, writer metadata application, constructor aliases or deep
entries. The archived `fstream-ignore` and `fstream-npm` family is not a
successor. Existing forks either carry narrow patches or stale copies and do
not provide a maintained, tested npm-compatible replacement.

## Decision

**GO.** Build `@stackline/fstream@1.0.0` as a compatibility-first maintained
fork of the exact 1.0.12 artifact.

The decision rests on verified active direct use, explicit unsupported status,
an archived source, a concrete and testable correctness backlog, a supportable
implementation size, avoidable deprecated runtime dependencies and no
maintained drop-in. It does not rest on downloads, publication age, a lockfile
or a dependency graph.

The release boundary is deliberately narrow:

1. preserve the CommonJS namespace, callable/newable factories, event order,
   metadata, filters, hard links, symlinks, writers and all historical deep
   entries;
2. add a real ESM facade and TypeScript 3.9-compatible declarations without
   inventing a browser contract;
3. support and test Node 14.15.1 through current Node, matching the strongest
   verified active direct consumer rather than claiming upstream's Node 0.6
   range;
4. replace deprecated runtime removal/directory helpers with bounded native
   equivalents while retaining callback behavior and created-directory
   metadata;
5. scope hard-link state to a traversal, propagate `follow` recursively with
   inode-based cycle prevention, replace the deprecated Buffer construction,
   and resolve issues 28/70 only where differential tests prove event-order and
   error compatibility;
6. preserve the ISC license and attribution, record every bundled or runtime
   license, and state explicitly that Stackline is not affiliated with or
   endorsed by the upstream maintainers.

Any regression in the upstream contract, safe cycle termination, hard-link
preservation, post-close error behavior, clean packed consumers, production
audit or supported runtime matrix is a red gate and blocks publication.

## Post-decision evidence clarification (2026-08-28)

Downstream validation at `webos-tools/cli` commit
`6d866e0fe06c1842e783ad10d551dbba8d39561e` refined, but did not reverse, the
direct-use finding above. The exact `fstream@1.0.12` declaration and the
Reader/Writer calls in the default packaging module are active direct use.
`lib/tar-filter-pack.js` does import and call `collect`, but the declaration
that would import that module from `lib/package.js` is commented out, and no
other live reference was found in the inspected commit. The `collect` use is
therefore classified as source-present but dormant, not as an active runtime
call path. The dated GO decision and its timestamp remain unchanged because
the independently verified active Reader/Writer path still supplies direct-use
proof.

Clarifying primary source records:

- https://github.com/webos-tools/cli/blob/6d866e0fe06c1842e783ad10d551dbba8d39561e/package.json#L59
- https://github.com/webos-tools/cli/blob/6d866e0fe06c1842e783ad10d551dbba8d39561e/lib/package.js#L17-L29
- https://github.com/webos-tools/cli/blob/6d866e0fe06c1842e783ad10d551dbba8d39561e/lib/package.js#L1677-L1683
- https://github.com/webos-tools/cli/blob/6d866e0fe06c1842e783ad10d551dbba8d39561e/lib/tar-filter-pack.js#L7-L34
