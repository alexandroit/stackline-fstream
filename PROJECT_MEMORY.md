---
schema: stackline-project-memory-v1
package: fstream
target: "@stackline/fstream"
version: 1.0.0
state: BUILDING
updated: 2026-08-28
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

## Current gate

The complete local gate passed on 2026-08-28: upstream, differential,
regression, malformed-input, stress, ESM, TypeScript 3.9/current, packed
consumer, package-quality, license, audit, and signature checks. Coverage is
87.40% statements/lines, 75% branches, and 89% functions across 119 assertions.
Runtime checks passed on Node.js 14.15.1, 16.20.2, 18.20.8, 20.20.2, 22.22.0,
and 24.7.0.

Artifact and publication details remain intentionally absent until the
one-time immutable preparation and registry verification complete.
