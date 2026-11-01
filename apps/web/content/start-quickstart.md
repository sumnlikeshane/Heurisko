# First investigation

Heurisko helps you investigate one exact package against source evidence. For a first visit, read the retained public example before collecting new evidence.

## Prepare the local reader

Follow [installation and execution](../../../README.md#installation-and-execution), then run the commands below from the repository root. There is no published installer. Use the pinned Node 22.23.4, pnpm 10.14.0 and Python validator environment.

```sh
pnpm run build
pnpm web --report examples/handoff/current/B1.report.json --store examples/handoff/current/store
```

Open the private loopback URL printed in the terminal. Keep it local. Home and Docs are public local pages; the URL authorizes evidence and investigation access for this reader in memory. No package is scanned by opening it.

## Read the retained example

1. Choose Reports, then open picocolors 1.1.1. Its original capture is 31 October 2026, 19:00:21 UTC.
2. Read Overview. Artifact integrity matched; source association is ambiguous, correspondence unresolved and analysis incomplete. These are independent facts, not a safety verdict.
3. Open Files. Select a recorded change, then its source and artifact evidence. Read actual recorded byte ranges and use Back to return to the selected item.
4. Inspect Source for competing claims and Coverage for missing or unsupported work.
5. Use Save when you need a report or portable evidence copy. Read the format description before requesting the download.

If the example is not admitted, follow [retained example setup](browser.md#retained-example). A report file alone may not contain its referenced evidence bytes.

## Collect new evidence in the browser

New analysis requires the admitted restricted Docker parser and public npm/GitHub access. Use public package and source data only.

1. Open **New investigation** and enter `npm:picocolors@1.1.1`, or use the explicit example action. Scoped exact versions such as `npm:@vue/shared@3.5.22` are supported.
2. Keep source options empty for normal npm source resolution, or pair an allowed GitHub URL with a full immutable commit. An override identifies a requested source candidate; it does not prove correspondence.
3. Review the exact target, selected bytes and requested options. Nothing uploads or starts until you choose Confirm and start.
4. Follow the job’s recorded activity, then open its report. A usable incomplete report commonly has CLI outcome 2. No-report failure has a separate recovery action.
5. Read what was established and what remains unresolved before inspecting individual changes. Empty findings with unavailable analysis do not establish a clean result.

Leaving the job page or closing the tab does not cancel. Cancellation is an explicit request; cleanup acknowledgment remains unobservable. Reconnection reads state and never starts work.

## Use the CLI

The same retained example can be inspected without a browser:

```sh
node packages/cli/dist/index.js inspect examples/handoff/current/B1.report.json --store examples/handoff/current/store --json
```

Expect validated report JSON and exit 2 for this historical incomplete report. Inspection makes no fresh registry or revocation check and runs no target code. A nonzero exit does not mean useful JSON should be discarded.

For a new exact npm investigation:

```sh
node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --store .heurisko/npm-run --no-ai --json
```

AI is disabled by default; `--no-ai` remains accepted. The reviewed deterministic analysis module still runs, while model inference remains unavailable. Keep a fresh output destination if adding `--report` or `--bundle`.

## Choose your next task

[Exact npm release](workflows-npm.md) · [Local archive and source replay](workflows-local.md) · [Explore evidence](workflows-evidence.md) · [Save and reopen](workflows-portable.md) · [Complete CLI reference](../../../docs/CLI%20Reference.md)

For access or restart problems, use [Connection and session](troubleshooting-session.md). For invalid targets or imports, use [Input, engine and import errors](troubleshooting-errors.md).
