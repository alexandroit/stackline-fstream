# Changelog

## 1.0.0 - 2026-08-28

- Preserve the `fstream@1.0.12` CommonJS namespace, callable/newable factories,
  constructor identities, event flow, metadata, and 14 historical deep entry
  points.
- Propagate `follow: true` through directory descendants and terminate
  ancestor symbolic-link cycles deterministically with an `ELOOP` warning.
- Scope hard-link tracking to one traversal while preserving emitted `Link`
  entries and the legacy inert `Reader.hardLinks` property.
- Replace deprecated `Buffer` construction and remove the obsolete `inherits`,
  `mkdirp`, and `rimraf` production dependency paths.
- Preserve read-only entry ordering and prevent spurious post-close errors
  without suppressing legitimate errors before close.
- Correct `ProxyWriter` delegated backpressure so a buffered proxy emits one
  `drain` only when its selected file or directory writer can accept more work.
- Make destinationless `collect()` replay terminate while preserving buffered
  entry, data, and end order.
- Add a real ESM facade, TypeScript 3.9/current declarations, conditional
  exports, and packed-consumer coverage.
- Establish an exact Node.js 14.15.1 runtime floor and test packed production
  artifacts through current Node.js releases.
- Add compatibility, migration, security, contribution, attribution, license,
  package-quality, coverage, audit, and static-analysis release gates.
