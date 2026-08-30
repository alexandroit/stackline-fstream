---
schema: stackline-project-memory-v1
package: fstream
target: "@stackline/fstream"
version: 1.0.1
state: BUILDING
updated: 2026-08-30
---

# Project Memory

## Decision

GO is frozen in [UPSTREAM_AUDIT.md](./UPSTREAM_AUDIT.md). The compatibility
baseline is the immutable `fstream@1.0.12` artifact, not a moving branch.

## Compatibility boundary

Preserve the 16-key CommonJS namespace, callable/newable Reader and Writer
factories, alias identity, filesystem metadata and events, hard-link and
symbolic-link behavior, and all 14 historical `lib/` entries. Add ESM and
first-party types without inventing a browser contract. The supported runtime
floor is exact Node.js 14.15.1.

The bounded corrections and migration risks are recorded in
[COMPATIBILITY_CONTRACT.md](./COMPATIBILITY_CONTRACT.md) and
[MIGRATION.md](./MIGRATION.md).

## Active dependency remediation

Version 1.0.1 replaces the stale `graceful-fs@4.2.11` production edge with
`graceful-fs@npm:@stackline/graceful-fs@1.0.0`. The historical dependency key
and runtime API remain unchanged. Release is blocked until the child is
published from its exact green artifact and the parent passes separate clean
direct and legacy-key installs with no warnings, a valid full tree, zero audit
findings, exact identity, license and SBOM checks.

## Retained 1.0.0 release evidence

The complete local gate passed on 2026-08-28: upstream, differential,
regression, malformed-input, stress, ESM, TypeScript 3.9/current, packed
consumer, package-quality, license, audit, and signature checks. The Node.js 24
coverage gate is 87.74% statements/lines, 75.69% branches, and 90% functions
across 127 assertions.
Runtime checks passed on Node.js 14.15.1, 16.20.2, 18.20.8, 20.20.2, 22.22.0,
and 24.7.0.

The exact source/tag commit is
`2b1bfc65c42bc19c1884ca85a50d7a9dab7d25f5`. Main CI run
`33144611174`, corrected-tag CI run `33144616977`, and CodeQL run
`33144611169` passed. The immutable 87-file artifact is 30,704 bytes with
SHA-1 `8fb2cbcf88fc0e6e7a5f7722674cbf2f7f5c320f` and SHA-256
`3e0fd31a8e7ea9351fcee321a1152aad48f8b4601d0c79d31b037163036ac4fd`.
All shipped regular files are mode `0644`.

Verdaccio and official npm serve byte-identical copies of that artifact.
Clean public scoped and historical-key alias consumers pass. GitHub release
`stackline-v1.0.0` is immutable and contains the exact tarball, checksums,
inventory, license record, release notes, manifest, and CycloneDX SBOM.
Production documentation and runnable examples are published at
<https://alexandro.net/docs/vanilla/fstream/> from final documentation commit
`b1c7cc62cf10a97e9e5af05daad6105921acaff6`; its final CI and CodeQL runs are
green.

The adoption lane opened the policy-first maintainer issue
<https://github.com/SAP/node-hdb/issues/320>. No pull-request candidate passed
the complete direct-use, runtime, test, and repository-policy gate, so one
qualified PR remains adoption debt; no weaker public contact was made.
