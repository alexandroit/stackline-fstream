# Adoption Targets

This is a pre-contact compatibility record, not evidence of consumer approval.
No contact is authorized until `@stackline/fstream@1.0.0` is publicly verified.

## Qualified migration pull request target

`webos-tools/cli` directly declares exact `fstream@1.0.12` and actively calls
Reader and Writer in `lib/package.js` on its normal IPK packaging path. Its
Node.js `>=14.15.1` contract matches the replacement. The minimal proposal is
the exact historical-key alias `fstream: npm:@stackline/fstream@1.0.0`, its
shrinkwrap update, and the repository-owned SBOM/license inventory updates.
Baseline install passed; its focused package suite had 61 passes and three
existing Linux exclusions. Full tests and lint retain substantial existing
environment/finding baselines that must not worsen.

## Qualified maintainer-decision issue target

`SAP/node-hdb` directly declares `fstream` for documented filesystem LOB
examples, including Reader and Writer calls. Its active Node.js 18+ and Node
20–26 CI contract is compatible. Contribution policy favors an issue before a
larger examples/dependency decision, so ask whether maintainers prefer an exact
alias, native filesystem streams, or removal of the legacy examples. Baseline
install and 586/586 automated tests passed; HANA-backed examples require an
external service and cannot be claimed as locally executed.

The pull request and issue target different repositories. Live GitHub
deduplication, current policy checks, target mutation tests, and maintainership
disclosure remain mandatory immediately before either public write.
