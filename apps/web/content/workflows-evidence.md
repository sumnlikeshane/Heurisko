# Explore evidence

## Prerequisites

Explicitly [open retained evidence](../README.md#saved-report-and-portable-browser-import) or open the report returned by a job. Reopening validates saved bytes; it never refreshes a release.

## Steps

1. Read the six independent outcomes on Overview. Check source identity and incomplete stages before interpreting counts.
2. In Files, filter changes or browse recorded artifact/source members and coverage omissions by path prefix. Status is recorded, not inferred.
3. Open a delta's source/artifact spans or a full member. Recorded byte ranges and displayed pages are separate; absent sides remain explicit.
4. Open related evidence and use Back or Escape to return. Byte windows and per-observation file selection remain in same-tab memory.
5. Inspect Source and Coverage for conflicts, excluded context and errors.

## Expected state and limits

Raw enclosing spans are not multi-hunk diffs or semantic equivalence. Generated candidates are unresolved candidates. Binary/split UTF-8 pages use base64; terminal controls are inert. Report-only input may lack blobs. [Portable export](workflows-portable.md) carries retained bytes and omissions; [identity](concepts-identity.md) explains interpretation limits.
