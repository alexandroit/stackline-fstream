# Registry Handoff

- upstream: `fstream@1.0.12`
- Stackline target: `@stackline/fstream@1.0.1`
- decision: GO, frozen before implementation in `UPSTREAM_AUDIT.md`
- runtime: Node.js `>=14.15.1`
- API: 16-key CommonJS root, callable/newable factories, constructor aliases,
  events, metadata, and 14 historical deep runtime entries
- additive: ESM and TypeScript 3.9/current declarations
- intentional corrections: descendant link following with ancestor-cycle
  termination, traversal-local hard links, readiness/terminal-event fixes,
  proxy backpressure, destinationless collection replay, and native helpers
- runtime dependency: exact
  `graceful-fs@npm:@stackline/graceful-fs@1.0.0`
- optional type peer: `@types/node>=14.18.0`; the TypeScript 3.9 gate uses
  exact `@types/node@14.18.63`
- publication status: release candidate; publication remains blocked until the
  exact child artifact and both clean parent consumer modes pass
- npm: <https://www.npmjs.com/package/@stackline/fstream>
- source: <https://github.com/alexandroit/stackline-fstream>
- previous immutable `1.0.0` release:
  <https://github.com/alexandroit/stackline-fstream/releases/tag/stackline-v1.0.0>
- documentation: <https://alexandro.net/docs/vanilla/fstream/>
- previous `1.0.0` source/tag commit:
  `2b1bfc65c42bc19c1884ca85a50d7a9dab7d25f5`
- previous `1.0.0` artifact SHA-1:
  `8fb2cbcf88fc0e6e7a5f7722674cbf2f7f5c320f`
- previous `1.0.0` artifact SHA-256:
  `3e0fd31a8e7ea9351fcee321a1152aad48f8b4601d0c79d31b037163036ac4fd`
- previous `1.0.0` artifact integrity:
  `sha512-i+Fk0TPLFysRmsMuoUzOG6WiZM+kWJBenJlPX8NtoFK2IwMUqhSkgtGp6/RI1GNMIggzVGEBhC4Q3aDg6my5nQ==`

Do not claim a browser contract, compatibility below Node.js 14.15.1, or a
vulnerability in a clean `fstream@1.0.12` install. Consumers using `follow`,
hard links, event timing, post-close cleanup, proxy drain, or `collect` replay
must exercise the documented bounded corrections against the exact candidate.
Use the published version, not a moving branch or locally rebuilt tarball.
