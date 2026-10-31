# Local web evidence explorer — actual portability check

**1 November 2026, Asia/Kolkata.** These are actual exports of previously generated public reports, not new acquisitions, analyses, model runs or refreshed verification. Original capture/creation times and raw report bytes are unchanged. The [verification receipt](verification.json) binds original content digests, four successful CLI comparisons, reopened reports and the web/reader code snapshot.

| Case | Portable manifest | Report | Included blobs | Omitted blobs |
|---|---|---|---:|---:|
| B1 picocolors | [manifest](B1/manifest.json) | [original report bytes](B1/report.json) | 84 | 0 |
| B2 ts-pattern | [manifest](B2/manifest.json) | [original report bytes](B2/report.json) | 302 | 0 |
| B3R @vue/shared monorepo | [manifest](B3R/manifest.json) | [original report bytes](B3R/report.json) | 740 | 0 |
| Inert local mutation | [manifest](local-mutation/manifest.json) | [original report bytes](local-mutation/report.json) | 76 | 0 |

The manifest is a transport record, not a signature. Each directory contains digest-named referenced blobs; JSON alone is insufficient to reopen all bytes. Original package/source LICENSE and notice content remains in the referenced blobs; third-party material retains its upstream rights. Heurisko's root license does not relicense it. Check manifests and original evidence before redistribution.

With the pinned setup:

```sh
pnpm run build
pnpm web --import examples/web/current/B1 --import examples/web/current/B2 --import examples/web/current/B3R --import examples/web/current/local-mutation
```

Open the private session URL printed locally. The reader uses loopback and ends access on Ctrl+C. A bare reload has no saved capability; reopen the startup URL. The browser performs no external acquisition. [Full usage and limits](../../../apps/web/README.md).

All four imported reports match the CLI JSON exactly; CLI inspection intentionally exits **2**, reflecting unavailable analysis/indeterminate policy. B1/B2/B3R/mutation preserve **19/143/31/20** changes and **zero stored findings**. Empty findings are not a clean assessment. B1's source ambiguity, B3R's explicit subtree/excluded scope and the mutation's local-input identity remain intact.

Mutation evidence `ev_8e5679afc3b6d3667eb09413` reopens artifact bytes `[585, 611)` as `"HEURISKO_INERT_TEST_ONLY"`; the source side is `SIDE_NOT_RECORDED`. This is an inert synthetic local mutation, not a real publisher compromise claim. No target script was run.

[Local validation and QA limits](validation.json) record workspace typecheck/build, full G0, **15 new web tests**, **24 unchanged headless checks**, the four portability/parity cases and source identities. Browser QA is **partial**: initial wide Chrome overview and file navigation were observed; later native automation became unreliable/time-limited. Exact 1440/1024/390 widths, 200% zoom, complete keyboard/evidence back-stack, browser-offline and no-external-request observation remain unverified. No screenshot artifact or universal browser support is claimed. Synthetic static rendering tests cover active markup/control/bidi/model text and F0–F6; they are not actual heuristic/model evaluation.

An initial attempt exposed the package-metadata scanner's 2,048-value ceiling on B3R's 740-entry transport manifest. The corrected web-only strict decoder handles this within its own 2 MiB/depth/node budgets; a real B3R regression now passes. The earlier attempt remains in ignored scratch `.heurisko/web-initial-transport-check`; no historical product capture was changed.

To generate a **new** check, supply a fresh directory under an existing real parent:

```sh
node apps/web/tooling/verify-corpus.mjs .heurisko/NEW_WEB_CHECK
```

The script exports/reopens four real reports, compares CLI JSON and preserves an immutable verification receipt. It does not overwrite this checkpoint.

W browser acceptance/shared review, TUI parity, genuine integrated findings/AI navigation, remote web CI and delivery remain open. Full G3/G5/P04 is not claimed. Product models: **none**. Coding assistance: **Codex**. No commit, push, PR publication, deployment, merge or external submission was performed for this web work.
