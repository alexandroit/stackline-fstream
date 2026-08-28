# Contributing

Use Node.js 20 or newer for development. The production runtime floor is
exactly Node.js 14.15.1, so runtime code and generated entry points must remain
executable there even though lint, build, test, coverage, package, and audit
tools run only on maintained development Node.js versions.

## Local workflow

1. Install the exact development graph with `npm ci`.
2. Make a focused change and add a characterization, regression, differential,
   type, or packed-consumer test for every observable behavior change.
3. Run `npm run verify` before proposing the change.
4. Review `npm pack --dry-run` output and ensure no fixtures, credentials,
   caches, or development-only files enter the artifact.

Preserve the 16-key CommonJS root order, callable/newable factories, alias
identities, 14 historical deep runtime entries, event ordering, decorated
errors, filesystem metadata, Node.js 14.15.1 syntax, TypeScript 3.9 declarations,
and ESM/CommonJS identity.

Changes to link following, hard-link state, filters, backpressure, terminal
events, destination removal, permissions, ownership, timestamps, or Windows
paths require tests for both the ordinary case and the failure or lifecycle
edge being changed. Do not suppress errors merely to make a lifecycle test
pass.

Do not add a production dependency without a compatibility need, a dated
security and maintenance review, an exact version, a license review, and an
update to `THIRD_PARTY_LICENSES.md`. Private helpers must not become public deep
imports accidentally. This project does not accept a browser build as an
implicit extension of the Node.js contract.

Keep generated files reproducible through the checked-in build script. Do not
hand-edit a generated facade without updating its source and regeneration path.

Do not include secrets, private registry settings, proprietary consumer
fixtures, personal data, or unlicensed source. Report vulnerabilities through
[SECURITY.md](./SECURITY.md), not a public issue.
