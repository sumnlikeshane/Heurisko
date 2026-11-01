# Heurisko

Heurisko investigates how an exact published package relates to a claimed source revision. It keeps the original bytes, source claims, file differences, findings and evidence links inspectable. It reports uncertainty when the available evidence cannot support a conclusion.

Heurisko is a product maintained by Shane Joseph as its sole owner. The project is under active development; a completed check or an exit code of 0 does not certify that a package is safe.

## What works today

- Analyze exact public npm versions or local tar/tar.gz archives with a static, restricted parser. Target packages are not installed or executed.
- Compare with an explicitly selected full GitHub commit and optional package subdirectory. Source claims and conflicts remain visible.
- Preserve raw artifacts, inventories, manifest deltas, evidence bytes and immutable reports in a local content-addressed store.
- Apply deterministic rules to retained script, entrypoint and unresolved-file differences. These findings guide review; they do not establish intent or provenance.
- Use the same report and evidence semantics through the CLI, interactive terminal app and local browser app.
- Browse three saved public reports at [heurisko.onrender.com](https://heurisko.onrender.com/). The public service is a read-only explorer and cannot start investigations.

Model inference, provenance verification, concrete trust policy evaluation, rebuilds, release monitoring, PyPI and hosted live analysis are not product capabilities yet. The [production roadmap](PRODUCTION_MASTER_ROADMAP.md) and [Phase 1 plan](docs/Production%20Phase%201%20Implementation%20Plan.md) track the next work. [AI development source](docs/production-phase1/AI%20Source%20Intake.md) is present for offline work; the currently admitted deterministic module remains separate from a model runtime.

## Installation and execution

Use Node.js **22.23.4**, pnpm **10.14.0**, Python **3.13**, and a running local Docker engine for new investigations. The parser image is pinned in source. The commands below run from the repository root:

```sh
pnpm install --frozen-lockfile --ignore-scripts
python3.13 -m venv .venv
.venv/bin/python -m pip install --require-hashes -r requirements-contracts.txt
pnpm run build
```

Pull the admitted parser image before a new investigation:

```sh
docker pull python:3.13.18-slim-bookworm@sha256:281d39ff02e3b389401586134ff9e6572954687822a58055ec07a60ded4e0b7f
```

The [complete system guide](HEURISKO_COMPLETE_GUIDE.md#5-install-and-build-locally) documents platform limits, parser prerequisites, retained-report viewing and troubleshooting.

## Use it

```sh
# CLI help and exact npm analysis
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --no-ai --store .heurisko/example --json

# Interactive terminal app, when stdin and stdout are terminals
node packages/cli/dist/index.js

# Local browser app; open the private loopback URL printed by the process
pnpm web
```

A fresh investigation may return exit **2** with a usable report when analysis is incomplete or a requested policy is indeterminate. AI is disabled by default; `--no-ai` remains accepted and retains deterministic analysis. Use `inspect REPORT --store DIR` to reopen a saved report and verify its evidence. See the [CLI reference](docs/CLI%20Reference.md), [terminal guide](packages/tui/README.md), [browser guide](apps/web/README.md), and [complete guide](HEURISKO_COMPLETE_GUIDE.md) for full options and examples.

## Reports and evidence

Reports keep artifact integrity, source association, provenance policy, correspondence, analysis completeness and policy result as separate outcomes. A matching registry digest establishes the identity of the downloaded archive against registry metadata; it does not prove benign code or a verified source build. Missing bytes and unsupported scope remain explicit. Old reports are retained observations and are not silently reanalyzed when opened.

[Representative inputs and generated reports](examples/README.md) show actual output and supporting evidence. The [contract package](packages/contracts/package.json) defines report semantics; the [system guide](HEURISKO_COMPLETE_GUIDE.md#4-reports-evidence-identities-and-result-meanings) explains IDs, hashes, evidence ranges and exit codes.

## Development

```sh
pnpm run typecheck
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts
pnpm run test:web
pnpm run check:docs
```

Start with [the contributor workflow](AGENTS.md#one-development-workflow) and [documentation index](docs/README.md). The [Phase 1 plan](docs/Production%20Phase%201%20Implementation%20Plan.md) owns current work and blockers; the [roadmap](PRODUCTION_MASTER_ROADMAP.md) defines each phase's acceptance and next step. Phase 1 remains open. The contributor test map selects checks appropriate to a change; phase acceptance requires the full owning gates. Product code changes use feature branches, review and exact-head CI. The [contributor instructions](AGENTS.md) define repository approval and evidence-preservation rules.

## License

Heurisko's original code and documentation are licensed under [Apache-2.0](LICENSE). Third-party examples and retained source bytes may have their own licenses; inspect their accompanying notices before reuse.
