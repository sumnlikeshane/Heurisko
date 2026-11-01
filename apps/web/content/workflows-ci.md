# Reports in CI

## Prerequisites

Use the built local executable and [setup](../../../README.md#installation-and-execution). There is no hosted analysis service or published install command. Protect immutable output paths.

## Capture both report and exit

```sh
node packages/cli/dist/index.js inspect examples/handoff/current/B1.report.json --store examples/handoff/current/store --json > retained-report.json
result=$?
printf 'Heurisko exit: %s\n' "$result"
```

Run this in a shell without fail-fast exit, or handle nonzero status explicitly in your CI runner. Expect useful JSON plus exit 2 for the retained incomplete example. This is a documented recipe, not a claim of remote CI execution.

## Interpret and retain

Exit 3 means command failure/no usable result; for a usable report, policy violation 1 precedes incomplete/indeterminate 2, then 0 for completed configured checks. Exit 0 never establishes harmlessness. Preserve stdout and stderr separately. Report/bundle references do not copy all evidence blobs.

Continue with [all output/exit details](../../../docs/CLI%20Reference.md#output-exits-and-ci) or [portable evidence](workflows-portable.md).
