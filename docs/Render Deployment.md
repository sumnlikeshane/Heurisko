# Render deployment preparation

The prepared Render Blueprint runs a public **captured-report explorer**. It serves Home, documentation and three pinned public observations: the integrated deterministic inert local mutation, historical ts-pattern 5.9.0 and historical incomplete-source zod 4.6.7. Capture times, original report bytes and retained evidence remain unchanged. Opening them does not acquire a release or run analysis.

This is a prepared deployment option, not an accepted substitute for the requested live hosted analyzer. Deployment and actual Render runtime acceptance must be recorded separately. Local `pnpm web` continues to provide the admitted full investigation workflow.

## Configuration

`render.yaml` selects the free web-service plan and production branch `main` after the reviewed feature PR is merged, with automatic deploys disabled. Deploy only a reviewed commit after its CI passes. No paid disk, database, model service or other billable resource is requested by this Blueprint.

`Dockerfile.render` combines Node 22.23.4 and Python 3.13.2, installs pnpm 10.14.0, installs the hash-pinned validator requirements and uses `pnpm install --frozen-lockfile --ignore-scripts` before the existing build. The service runs as UID/GID 10001. The explicit Docker context allowlist excludes private workspace state, credentials, tooling, generated dependencies and original incoming attachments. No Docker daemon/socket is exposed to the service.

The process requires `HEURISKO_WEB_MODE=public-readonly`, Render's trusted `RENDER_EXTERNAL_URL` HTTPS `onrender.com` origin and a valid `PORT`. It binds `0.0.0.0:$PORT`. Request and forwarded headers never select the allowed origin. Exact Host/Origin, fetch-site, route/query and evidence range checks remain enforced. `GET /healthz` returns minimal health/mode information under the same origin boundary. Public HTML declares the read-only mode; no private session capability is generated or logged.

The hosted launcher admits only its three source-defined report/store pairs after report SHA-256 checks and normal strict report validation. Arbitrary startup arguments fail closed. Public reads expose only this committed catalog. Every mutation, including uploads, investigations, cancellation, reopen and portable export, is rejected before body parsing. Original report and bundle downloads remain available; they do not embed all referenced blobs. Full portable export/import remains a local workspace feature.

## Live analysis runtime boundary

Render supports building and running a Docker service image. Its web-service documentation requires `0.0.0.0:$PORT` and describes TLS termination at Render's proxy. These features do not themselves establish access to the Docker daemon needed by Heurisko's parser. [Render Docker](https://render.com/docs/docker), [web services](https://render.com/docs/web-services)

Heurisko explicitly uses a **local Unix Docker socket** and per-job bind mounts. Its admitted parser is a separate digest-pinned container with no network, read-only root, non-root UID, bounded memory/CPU/PIDs/wall time and acknowledged cleanup. The public service image is not that per-job isolation boundary. Installing a Docker client alone cannot supply a daemon or equivalent isolation. Ambient remote Docker hosts are intentionally ignored.

The consulted Render Docker/Blueprint documentation does not establish a supported privileged-container or host-socket configuration. This is an unverified capability, not proof that every possible Render architecture is impossible. Do not add a host parser fallback or silently weaken isolation. Before enabling live hosted investigations, establish and validate a worker architecture that preserves the admitted limits, code identity, storage, cancellation and cleanup semantics. Render Sandboxes is a different API/runtime and needs separate admission rather than being treated as a drop-in parser. [Blueprint reference](https://render.com/docs/blueprint-spec), [Render Sandboxes](https://render.com/docs/sandboxes)

Render's default filesystem is ephemeral. This sample service accepts no uploads or new reports, so it promises no user-data persistence. Paid disk persistence is a separate choice. [Persistent disks](https://render.com/docs/disks)

## Local verification

Use the repository's pinned Node/Python setup:

```sh
pnpm run build
pnpm --filter @heurisko/web typecheck
pnpm --filter @heurisko/web test
docker build --platform linux/amd64 -f Dockerfile.render -t heurisko-render-check .
```

Render builds Linux amd64 images. Select that platform explicitly when verifying from an Apple Silicon host; the admitted requirements retain macOS arm64/Linux amd64 wheel hashes. The initial native Linux arm64 attempt correctly rejected the unadmitted `rpds-py` wheel hash; no hash or dependency policy was weakened. [Render Docker platform guidance](https://github.com/render-oss/skills/blob/main/skills/render-docker/SKILL.md#platform-specifics)

The Docker build requires network access to exact existing package versions and digest-pinned base-image registries. Source/unit tests alone do not certify that container build or a real Render deployment passed. Hosted HTTP regressions exercise anonymous sample reads, original download bytes, spoofed Host/Origin/forwarded headers and mutation rejection before parsing; local-mode tests continue to exercise capability-protected investigation and import/export behavior. Final deployment receipts must identify the exact commit, image/build result, URL, health and actual browser evidence journey.
