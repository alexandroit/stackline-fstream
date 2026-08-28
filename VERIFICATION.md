# Verification

Observed on 2026-08-28 in the package workspace.

## Passed local gates

- 23 adapted upstream compatibility assertions and the independent upstream
  four-suite/24-assertion baseline passed.
- Differential Reader, Writer, event, export, alias, and deep-entry checks
  passed.
- 65 focused regression, 29 malformed-input/lifecycle, and 10 stress assertions
  passed.
- Combined Node.js 24 coverage passed 127/127 assertions at 87.74%
  statements/lines, 75.69% branches, and 90% functions.
- ESM namespace/identity and all public deep facades passed.
- TypeScript 3.9 and current TypeScript CommonJS/ESM consumers passed with the
  explicitly installed Node declaration peer.
- Clean packed scoped, historical-key, CommonJS, ESM, deep-entry, example, and
  type consumers passed.
- Runtime checks passed on exact Node.js 14.15.1, 16.20.2, 18.20.8, 20.20.2,
  22.22.0, and 24.7.0.
- `publint` reported no errors; its optional `sideEffects` suggestion is not a
  compatibility gate. Are the Types Wrong reported no problems.
- Production and complete audits found zero known vulnerabilities. All 305
  installed registry packages had verified signatures; 24 had attestations.
- The installed production graph and license gate contain only exact
  `graceful-fs@4.2.11` under the package root.

## Pre-publication holds

The immutable artifact, registry byte comparisons, GitHub release, production
documentation, and downstream adoption contacts are recorded here only after
their live gates complete. Never infer publication from this local record.
