# Local archive and source replay

## Prerequisites

Use public tar/tar.gz bytes and [setup](../../../README.md#installation-and-execution). Each selected archive must be nonempty and at most 32 MiB. Selection alone does not upload; confirmation copies bytes into private local workspace storage.

## Steps

1. Choose Local archive in New investigation and select the artifact. Labels are optional.
2. For comparison, pair an allowed GitHub repository URL with its full 40 lowercase hex commit. A selected source archive requires that pair and is a user assertion about the snapshot.
3. Review filenames, sizes, source/subtree, labels, AI request and policy, then confirm explicitly.
4. Follow Jobs and open the immutable result. Cancellation requests abort; cleanup acknowledgment remains unobservable.

## Expected result and next task

The artifact remains local-input with its own digest. It never inherits registry integrity or provenance. Missing source is a recorded limit, not a match. [Local CLI replay syntax](../../../docs/CLI%20Reference.md#local-archive-and-source-replay) and [evidence exploration](workflows-evidence.md) explain next steps. For invalid input use [errors](troubleshooting-errors.md).
