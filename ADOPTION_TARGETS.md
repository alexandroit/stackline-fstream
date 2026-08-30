# Adoption Targets

This is a dated compatibility and contact record, not evidence of consumer
approval. `@stackline/fstream@1.0.0` is publicly verified.

## Pull request lane — NO_QUALIFIED_TARGET

`webos-tools/cli` directly declares exact `fstream@1.0.12` and actively calls
Reader and Writer in `lib/package.js` on its normal IPK packaging path. Its
Node.js `>=14.15.1` contract matches the replacement. The minimal proposal is
the exact historical-key alias `fstream: npm:@stackline/fstream@1.0.0`, its
shrinkwrap update, and the repository-owned SBOM/license inventory updates.
Baseline install passed; its focused package suite had 61 passes and three
existing Linux exclusions. However, the written contribution policy requires
a `develop` base, every unit test passing on a configured device/emulator, and
zero ESLint findings. The clean default-branch baseline has 68 full-suite
environment failures and substantial existing lint findings. A compliant PR
cannot be demonstrated without maintainer direction, so no PR was opened.

Fresh alternatives were also rejected without contact: check-file-dependencies
contains fstream only in frozen parser fixtures; packed-updater contains only a
commented import; Bower and sdc-manta would suffer incompatible Node-floor
contractions; SAP/node-hdb requires issue-first direction and HANA-backed
example validation. One qualified PR remains adoption debt.

## Maintainer-decision issue — OPEN

`SAP/node-hdb` directly declares `fstream` for documented filesystem LOB
examples, including Reader and Writer calls. Its active Node.js 18+ and Node
20–26 CI contract is compatible. Contribution policy favors an issue before a
larger examples/dependency decision, so ask whether maintainers prefer an exact
alias, native filesystem streams, or removal of the legacy examples. Baseline
install and 586/586 automated tests passed; HANA-backed examples require an
external service and cannot be claimed as locally executed.

The personalized, non-security maintenance question is open at
<https://github.com/SAP/node-hdb/issues/320>. It identifies the exact manifest
and example paths, offers alias/native/removal alternatives, records the clean
baseline and HANA limitation, and discloses Stackline maintainership.

Because no PR passed, the different-repository check is not yet applicable.
Live GitHub deduplication found no prior Stackline contact or competing
migration immediately before the issue. Record incoming maintainer messages for
owner review without replying, acknowledging or reacting.
