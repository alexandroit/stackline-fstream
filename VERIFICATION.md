# Verification

Observed through 2026-08-30 in the package workspace.

## 1.0.1 dependency remediation

- The production manifest now preserves the `graceful-fs` import key through
  the exact `npm:@stackline/graceful-fs@1.0.0` alias.
- The new closure gate uses separate fresh consumers for direct scoped and
  historical-key parent installs and checks warning output, full production
  trees, production audits, runtime loading, lockfiles and exact child identity.
- License and SBOM gates require the maintained child package and its preserved
  ISC attribution.
- Final local, hosted, Verdaccio and official-registry evidence remains pending
  until the child release is available from the target registry.

## Retained 1.0.0 evidence

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
- The former installed production graph and license gate contained only exact
  `graceful-fs@4.2.11` under the package root. That edge triggered the 1.0.1
  remediation and is not accepted for a new release.

## Publication and external verification

- Main CI `33144611174`, corrected-tag CI `33144616977`, and CodeQL
  `33144611169` passed at commit
  `2b1bfc65c42bc19c1884ca85a50d7a9dab7d25f5`.
- The normalized local candidate and clean CI artifact are byte-identical:
  SHA-256
  `3e0fd31a8e7ea9351fcee321a1152aad48f8b4601d0c79d31b037163036ac4fd`.
  Every one of 87 reported tar entries is mode `0644`.
- Verdaccio accepted first; its fetched tarball, scoped consumer, and
  historical-key npm-alias consumer passed.
- Official npm accepted the same bytes once. A short public-read replication
  delay returned E404 after the successful PUT; no republish was attempted.
  Public metadata, direct tarball bytes, clean scoped install, and clean alias
  install subsequently passed at 2026-08-28T05:31:03Z.
- The GitHub release contains nine exact assets and reports `immutable: true`.
  Its downloaded tarball is byte-identical to the registry candidate.
- The 1.0.0 CycloneDX SBOM was generated from an isolated production install
  and records `@stackline/fstream@1.0.0 -> graceful-fs@4.2.11`.
- Production package docs, catalog/search/robots, examples, and aggregate
  sitemaps were published from `stackline-open-source` commits
  `22808f7866346f9fdab1ce59d2657f2ef934246e` and
  `474943569dacc29bf196fdfd9feb25be24074998`, with final release record commit
  `b1c7cc62cf10a97e9e5af05daad6105921acaff6`. Final CI run `33145877462` and
  CodeQL run `33145877284` pass. Cloudflare-visible checks returned 200 with
  expected MIME for all 24 routes; both aggregate sitemaps contain 11 fstream
  routes.
- Adoption issue <https://github.com/SAP/node-hdb/issues/320> is open. The PR
  lane recorded `NO_QUALIFIED_TARGET`; one qualified PR remains debt.
