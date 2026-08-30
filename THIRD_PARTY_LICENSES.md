# Third-Party Licenses

## fstream

- Upstream: <https://github.com/npm/fstream>
- Compatibility baseline: `fstream@1.0.12`
- Authors: Isaac Z. Schlueter and Contributors
- License: ISC

The maintained implementation derives from upstream source and tests. The
complete upstream ISC notice is retained in [LICENSE](./LICENSE), and the
independent-project attribution is recorded in [NOTICE](./NOTICE). Upstream
tests used as development evidence are excluded from the npm artifact.

## Production dependency graph

| Package | Version | License | Purpose | Source |
| --- | --- | --- | --- | --- |
| `@stackline/graceful-fs` | 1.0.0 | ISC | Filesystem compatibility and graceful descriptor handling, installed under the historical `graceful-fs` key | <https://github.com/alexandroit/stackline-graceful-fs> |

`@stackline/graceful-fs` preserves the upstream ISC attribution and installs
its complete license file with the package:

> Copyright (c) 2011-2022 Isaac Z. Schlueter, Ben Noordhuis, and Contributors

`@types/node` is an optional type-only peer supplied by TypeScript consumers;
it is not installed or bundled by this package's production graph. Development
dependencies are not included in the production package graph or npm artifact;
they remain governed by the license files installed with those tools. The
release license gate verifies the exact production version and its installed
ISC license.
