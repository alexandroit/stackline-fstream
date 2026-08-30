# Security

Report suspected vulnerabilities privately through the GitHub security
advisory form for `alexandroit/stackline-fstream`. Do not disclose an unfixed
vulnerability in a public issue.

Include the affected version, Node.js version, operating system and filesystem,
a minimal reproduction, expected and actual events, path/link layout, impact,
and any suggested mitigation. Maintainers will validate the report and
coordinate disclosure with a corrected release.

## Supported line

The latest published `1.x` release is supported on Node.js 14.15.1 and newer.
Development tooling requires Node.js 20 or newer but is not part of a production
installation.

## Production dependency statement

The only production dependency is exact-pinned
`graceful-fs@npm:@stackline/graceful-fs@1.0.0`. The npm alias preserves the
historical runtime key while resolving to the maintained, dependency-free ISC
package. The release gate checks separate scoped and historical-key installs,
the complete production graph, licenses, warning output, tree validity and npm
audit results. The old `inherits`, `mkdirp`, and `rimraf` production paths are
not present.

The upstream advisory
[GHSA-xf7w-r453-m56c](https://github.com/advisories/GHSA-xf7w-r453-m56c)
affects `fstream` versions below `1.0.12`. This project derives from the patched
`1.0.12` baseline and must not represent a clean `1.0.12` installation as
affected by that historical range.

## Filesystem trust boundary

This library performs caller-directed filesystem operations. In particular:

- writers can create or replace files, directories, and links and can apply
  modes, ownership, and timestamps where permissions allow;
- incompatible destinations are clobbered by default;
- `follow: true` traverses symbolic links outside the lexical source tree when
  the target resolves there;
- filters receive filesystem-derived metadata but do not create a sandbox; and
- filesystem changes are not transactional and may be partially complete when
  an error occurs.

Callers must validate source and destination paths, enforce an allowed root,
decide whether link following and clobbering are acceptable, constrain
permissions, and avoid applying untrusted ownership or metadata. Ancestor-cycle
detection bounds recursive link traversal; it does not prevent traversal to a
non-cyclic target outside an allowed directory.

Do not use this package as an archive extraction policy by itself. Archive
callers must reject absolute paths, traversal segments, unsafe links, special
files, and resource-exhaustion inputs before passing entries to a writer.

## Availability considerations

Large trees, deep trees, unusual devices, and adversarial filesystems can
consume time, file descriptors, memory, or disk. Apply application-level size,
depth, entry-count, timeout, and cancellation limits when input is not trusted.
The package has no browser security model.
