# First investigation

## Prerequisites

Use public data and the [repository setup](../../../README.md#installation-and-execution). New analysis requires the admitted restricted Docker parser and public npm/GitHub access. Opening saved evidence needs the pinned validator and retained bytes. No published installer is offered.

## Browser: choose and review

1. Start `pnpm web` after building and open the private loopback launch URL. Keep it local.
2. Choose New investigation, enter `npm:picocolors@1.1.1`, and optionally uncheck Request AI. Nothing runs on navigation.
3. Review the exact target, source/options and selected file sizes. Only Confirm and start admits uploads and starts the shared engine.
4. Follow the selected job. A valid incomplete report commonly has CLI outcome 2. Open its report explicitly.
5. Inspect Source and Coverage, then Files and exact evidence bytes. Empty findings do not mean safe.

[Start an investigation](../README.md#browser-investigation-and-outputs) or [open saved evidence](../README.md#saved-report-and-portable-browser-import). Session links require the launch capability; public docs do not.

## CLI: inspect retained evidence first

From the built repository root:

```sh
node packages/cli/dist/index.js inspect examples/handoff/current/B1.report.json --store examples/handoff/current/store --json
```

Expect validated report JSON and exit 2 for this historical incomplete report. Inspection makes no fresh registry/revocation check and does not run target code. This guide does not claim a new acquisition.

## Next task

Choose [exact npm](workflows-npm.md), [local replay](workflows-local.md), [Inspect reference](../../../docs/CLI%20Reference.md#inspect-reports-and-evidence) or [connection help](troubleshooting-session.md).
