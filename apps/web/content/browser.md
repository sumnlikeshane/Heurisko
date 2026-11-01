# Use the browser workspace

Heurisko compares one exact package archive with evidence for an immutable source revision. Start an investigation to collect evidence, or open an existing observation to read it. Reading a report never starts a scan.

## Setup and open

Complete [installation and execution](../../../README.md#installation-and-execution) in the repository, then run this from its root:

```sh
pnpm run build
pnpm web
```

Open the private loopback launch URL printed in your terminal. It authorizes this reader in memory. Keep that URL private. Home and Documentation work without it; investigation and evidence access need the connected reader. There is no hosted account or published installer.

## Retained example

To read a public observation already in this checkout, launch the reader with its matching report and evidence store:

```sh
pnpm web --report examples/handoff/current/B1.report.json --store examples/handoff/current/store
```

Open the printed private URL, choose Reports, then open picocolors 1.1.1. This observation was captured on 31 October 2026 at 19:00:21 UTC. It records matched artifact integrity, ambiguous source association, unresolved correspondence and incomplete analysis. Those outcomes do not establish harmlessness. Starting this reader does not reacquire the release.

The example file and store are retained repository material. If they are absent from your checkout, follow [installation and execution](../../../README.md#installation-and-execution) to obtain the full workspace; a report alone may lack evidence bytes. Nothing on Home downloads an example or starts analysis automatically.

## Start an investigation

1. Choose **New investigation**. Select an exact public npm coordinate, such as `npm:picocolors@1.1.1`, or a public local tar/tar.gz archive.
2. Optionally provide a GitHub repository and full immutable commit, with a package subtree when needed. This identifies the comparison source you requested; it is not proof that the package came from that source.
3. Review the exact target, selected files, source and requested options. File selection alone sends no bytes.
4. Choose **Confirm and start** once to admit selected bytes and start one real job. A lost acknowledgment requires checking Jobs before considering another explicit start.
5. Follow the recorded activity, then open the resulting report. An incomplete but usable report differs from a failure that produced no report.

Use the [npm task guide](workflows-npm.md) or [local archive and replay guide](workflows-local.md) for constraints. The [Analyze command reference](../../../docs/CLI%20Reference.md#analyze-inputs-and-constraints) covers the equivalent CLI options exactly.

## Follow a job

Jobs records execution in this reader process. It is not a durable release monitor. Keep the active job link when moving to Docs or another report. Leaving the page or closing a tab does not cancel it.

**Request cancellation** asks the engine to stop. `cancel_requested` is distinct from a settled report or settled error. Cleanup acknowledgment remains `not_observable`; a settled job is not a cleanup guarantee. No ETA, automatic retry, queue or durable resume is offered.

If the reader disconnects, check its terminal and use the read-only refresh action. Reconnecting never starts work. A process restart loses job and observation handles; reopen retained evidence explicitly instead.

## Read a report

Start at Overview: what was established, what remains unresolved and where to inspect next. Artifact integrity, source association, provenance policy, correspondence, analysis completeness and policy result remain independent. AI interpretation is separate.

Use Files and Findings to reach supporting records, then inspect exact source and artifact bytes. Coverage retains omissions and stage failures; Source retains competing candidates and conflicts. A generated-looking filename is not an exemption. No recorded findings with unavailable analysis is not a clean assessment.

The [evidence task guide](workflows-evidence.md) explains paths, byte ranges, binary data and return navigation. The [identity concept](concepts-identity.md) distinguishes artifact digest, report ID, report content reference and process-local observation handle.

## Save and reopen

Save belongs to the selected report. Choose original report JSON, EvidenceBundle JSON or portable evidence, then explicitly request preparation. The app can confirm a download request; it cannot confirm a filesystem save.

Report JSON retains original report bytes and references. Bundle JSON is the evidence bundle without its enclosing report. Neither alone contains all referenced evidence bytes. Portable evidence includes the original report and retained bytes within the export limits, plus explicit omissions and rights notices.

**Open evidence** accepts a report file, portable evidence, or an exact report content reference in the fixed workspace store. It validates the selected format and binding. A standalone bundle cannot be imported as a report. Reopening retains capture time and makes no fresh registry or provenance check.

Read [Save and reopen](workflows-portable.md) for format limits and recovery from missing bytes, corruption or an expired handle. Terminal startup report/store admission and directory transport remain available in the [browser technical reference](../README.md#portable-directory-export-and-import).

## Capability limits

The current shared producer collects static archive/source evidence and raw comparisons. The analysis module, model, provenance verifier, concrete policy evaluator, rebuild and release monitor are not integrated into this web workflow. Requesting an option cannot supply them. The AI request follows the CLI request semantics; this viewer does not fabricate an interpretation.

For complete current support and the separate terminal interface, read [Current capabilities](availability.md). Advanced resource, transport and contributor details remain in the [browser technical reference](../README.md), and all canonical commands remain in the [complete CLI reference](../../../docs/CLI%20Reference.md).

## Troubleshooting

Use [Connection and session](troubleshooting-session.md) for private-launch access, disconnected readers and restart behavior. Use [Input, engine and import errors](troubleshooting-errors.md) for invalid targets, admission errors, missing evidence and invalid exports. Correct a field or retry a read explicitly; never bypass validation or automatically resubmit a job.
