# Exact npm release

## Prerequisites and input

Complete [setup](../../../README.md#installation-and-execution). Use one public exact coordinate, including scopes: `npm:@vue/shared@3.5.22`. Tags, ranges, aliases and alternate registries are unsupported.

## Steps

1. Open New investigation and choose Exact npm release.
2. Enter the coordinate. Optional source URL and full commit must be paired; a subtree requires that pair. npm cannot use a local source replay archive.
3. Review then confirm. Selected job progress comes from the shared engine. Leaving the page does not cancel it.
4. Open the returned report, inspect all source candidates/conflicts and raw changes.

## Expected result and limits

Registry digest agreement identifies acquired bytes. Source candidates, version labels and tags alone do not prove source correspondence. Advertised attestations are unverified. Missing heuristics/model/policy evaluation stays incomplete or indeterminate, often exit 2.

See [Analyze reference](../../../docs/CLI%20Reference.md#analyze-inputs-and-constraints), [identity](concepts-identity.md) and [evidence exploration](workflows-evidence.md).
