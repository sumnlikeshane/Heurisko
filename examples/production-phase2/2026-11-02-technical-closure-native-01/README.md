# Native Linux AMD64 closure investigation

This fresh observation preserves the earlier failed native admission. Read-only
capability discovery found a Darwin ARM64 host and only local Docker contexts;
the production-selected Unix socket serves an AArch64 Docker Desktop engine.
No SSH host aliases or accessible native runner were configured. Discovery did
not inspect credentials, provision infrastructure, publish source or dispatch CI.
`capability.json` binds the captured command outputs and limitations.

The prepared runner had an admission mismatch: its plain `docker info` observed
the ambient Docker context, whereas the parser and verifier force a local Unix
socket. A remote AMD64 context could therefore satisfy the engine check while
actual tests used another engine. The runner now probes the same fixed socket,
without ambient Docker configuration variables, and requires successful tool
observations. Three guard tests exercise host/Node/engine agreement, ARM and
Desktop rejection, remote-context isolation and all pinned tool requirements.
`runner-guards.json` records their actual result and exact tooling hashes. These
tests establish admission behavior, not successful native execution.

The manual workflow now retains the controlled runtime identity, fixed test
bootstrap and actual built worker/host evaluator alongside the signed fixtures
and application results. It does not upload installed dependency links. The
identity file binds those compiled bytes to the test anchor and production
evaluator; controlled fixtures remain distinct from genuine npm provenance.

Native acceptance still requires an accessible authorized Linux x86_64 host with
host Node x64 22.23.4, pnpm 10.14.0, Python 3.13 and a native local x86_64 Docker
engine. Alternatively, the prepared workflow can run after separate approval
covering the concrete final feature-branch source publication and CI dispatch.
Existing Phase 1 CI does not establish results for this dirty Phase 2 source.
The owner is not assigned test execution. No native check or publication pass
is inferred from the prepared tooling or this investigation.


Source-bound admission was actually executed after source freeze: [admission](admission-final/admission.json), [result](admission-final/summary.json). The selected source manifest is `ba5fda889734514e04006b202a42c54e48a1e03694347a63ba6bcc37d3248fb2`; pinned tools are admitted, but host/engine native admission is false. Exit 2 (`NATIVE_LINUX_AMD64_UNAVAILABLE`), zero native checks executed and `nativeAccepted: false`. This is an observed access/platform blocker, not native verification or CI evidence.
