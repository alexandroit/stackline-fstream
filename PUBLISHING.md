# Publishing

`@stackline/fstream` releases use one operator-frozen npm tarball. GitHub
Actions has no npm write credential and cannot publish a second, independently
packed artifact.

## Release gate

1. Confirm the version has never existed on Verdaccio or official npm.
2. Commit every package file and release script on `main`; the worktree must be
   clean.
3. Run `npm run artifact:prepare` once. The command reruns the complete
   `npm run verify` gate, packs without lifecycle scripts, creates checksums,
   inventory, license metadata, and a production SBOM from an isolated install,
   then atomically renames the complete staging directory.
4. Confirm the tarball matches the artifact built by CI from the recorded
   source commit and that the version tag is `stackline-v<version>`.
5. Publish `./release-candidate/stackline-fstream-<version>.tgz` to Verdaccio,
   fetch and byte-compare it, and run clean scoped plus historical-key alias
   consumers.
6. Publish that same path once to official npm with the authenticated
   `alex360qc` account, fetch and byte-compare it, and repeat the consumers.
7. Attach the exact release-candidate assets to the immutable GitHub release.

Never run `npm publish .` or rebuild a version after `release-candidate/`
exists. Human-factor authentication is retryable; it is never bypassed. A
failed registry metadata read after a successful publish is a propagation
check, not permission to republish.

Official npm provenance requires a supported cloud publisher. This release's
operator-controlled publication instead records the exact source commit,
builder versions, SHA-1/SHA-256/SHA-512, npm integrity, registry byte
comparisons, CI artifact comparison, license evidence, and CycloneDX SBOM.
