# Registry Handoff

- upstream: `fstream@1.0.12`
- Stackline target: `@stackline/fstream@1.0.0`
- decision: GO, frozen before implementation in `UPSTREAM_AUDIT.md`
- runtime: Node.js `>=14.15.1`
- API: 16-key CommonJS root, callable/newable factories, constructor aliases,
  events, metadata, and 14 historical deep runtime entries
- additive: ESM and TypeScript 3.9/current declarations
- intentional corrections: descendant link following with ancestor-cycle
  termination, traversal-local hard links, readiness/terminal-event fixes,
  proxy backpressure, destinationless collection replay, and native helpers
- runtime dependency: exact `graceful-fs@4.2.11`
- optional type peer: `@types/node>=14.18.0`; the TypeScript 3.9 gate uses
  exact `@types/node@14.18.63`
- publication status: BUILDING; do not recommend migration until the exact
  candidate has passed both registries and the public release gates

Do not claim a browser contract, compatibility below Node.js 14.15.1, or a
vulnerability in a clean `fstream@1.0.12` install. Consumers using `follow`,
hard links, event timing, post-close cleanup, proxy drain, or `collect` replay
must exercise the documented bounded corrections against the exact candidate.
