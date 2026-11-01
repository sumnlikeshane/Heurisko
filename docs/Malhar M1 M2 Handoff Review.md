# Malhar M1/M2 handoff and independent review

1 November 2026. Shane authorized the pinned npm handoff, independent review of the v12 behavior answer and suggested action, PR creation and CI confirmation. [PR #4](https://github.com/sumnlikeshane/Heurisko/pull/4) reviews the already-pushed `codex/malhar-rag-evaluation` at `e8b8116f9960527d0a82e066059d7792c405defe` against `main`. No new commit, push, merge, live inference or target lifecycle execution was performed. The active checkout and the separate visual worktree were preserved. This review is a separate Codex source/evidence check on Shane's behalf, not a human Shane review or general M1/M2 acceptance.

The full handoff and independent review are published in the PR description. [Local fixture and receipts](../examples/malhar-handoff/current/README.md) retain the new esbuild capture, original report/bundle/store, selected manifest bytes and model-off consumer outputs. Those new files are local additions, **not contents of e8b8116**. The picocolors positive case already exists in the published `81346271f5a3789b4b43fd8f379014656011823d` foundation checkpoint.

## Genuine npm lifecycle control

| Field | Pin |
|---|---|
| Name/version | `esbuild@0.25.12` |
| Tarball | [esbuild-0.25.12.tgz](https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz) |
| Artifact SHA-256 | `227584145829e5c4782734b3fb7b91b49c6aa12876d6cf070e6a3d9d4de543f9` |
| Expected and observed SRI | `sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==` |
| Repository | `https://github.com/evanw/esbuild` |
| Immutable commit | `208f539945b145e7c9d6d844290f81c3fe5af320` |
| Package subdirectory | `npm/esbuild` |
| Source archive SHA-256 | `783fa55416dc20211affd339e90608dbf2c56b15939fd416510d24a967ff9efa` |
| Observation | `2026-10-31T22:39:43Z` / 1 November 04:09:43 IST |

Artifact manifest `ev_9ea14095d99a65b64469c4a2` addresses archive member `package/package.json`, bytes `[0,1490)`. Source manifest `ev_45bf1ae6aa60abb918973bdb` addresses `esbuild-208f539945b145e7c9d6d844290f81c3fe5af320/npm/esbuild/package.json`, bytes `[0,1490)`. Both have SHA-256 `cb7d5b1fe478f8cbaae566a86031b6fdf5f7d444354f35d1cb3cba9adf6d2935`. Both contain `/scripts/postinstall` on line 10, JSON value `"node install.js"` at bytes `[256,273)`. See the [immutable source line](https://github.com/evanw/esbuild/blob/208f539945b145e7c9d6d844290f81c3fe5af320/npm/esbuild/package.json#L10) and the [unchanged producer records](../examples/malhar-handoff/current/fixture.json).

These are genuine byte-identical lifecycle-bearing manifests. The unchanged M1 module returns **zero lifecycle-change findings**. This is an unchanged control, not a genuine upstream modification, proof of harmlessness or full rule-quality acceptance. The source is explicitly selected; registry `gitHead` remains an unverified publisher claim. Provenance remains `not_checked`. The strict source parser reports `ARCHIVE_UNSUPPORTED_ENTRY`; the original report retains incomplete source/inventory/comparison and outside-subtree omissions. The real CLI exits **2**. No isolation rule was weakened to obtain a passing result.

## Labeled local positive probe

The genuine [picocolors@1.1.1 tarball](https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz) has SHA-256 `d3aedb2807967b7eb37fd11b03b7e3701e725af79c650d0812ff7213f8f882d9`. The separate **synthetic local-input** `picocolors-1.1.1.local-inert-mutation.tgz` has SHA-256 `bcdd003ee749b70575fb2793d3892a393d1224457ecb8ca9c37ff4cfd55e098d`. It adds the inert `scripts.postinstall` literal `HEURISKO_INERT_TEST_ONLY` and a comment-only marker file. Nothing was installed, imported or executed; changed bytes inherit no registry integrity or provenance success.

The explicit comparison target is `https://github.com/alexeyraspopov/picocolors`, commit `6f0a4638348ed20633d623ee973f9c9a96f65104`, repository-root subdirectory `""`. Its manifest says **1.1.0**, while the registry artifact is **1.1.1**. Keep that source-version conflict visible; this is not a proved corresponding release commit.

| Evidence | Exact member/locator | SHA-256 |
|---|---|---|
| Genuine artifact `ev_e230092de7aea9bb23526f1a` | `package/package.json`, `[0,552)`; no scripts object | `ef2ac226c4811d312e12c64214c453878653e834482125ae475f27cea60de737` |
| Local mutation `ev_fac6fd5699ff0c83dd8be093` | `package/package.json`, `[0,618)` | `f47239397b7822519c35144a37158b0ff4bb7eeddf325e8b518774ab6be02c61` |
| Source `ev_8504e9232685621e15be63cc` | `picocolors-6f0a4638348ed20633d623ee973f9c9a96f65104/package.json`, `[0,1107)`; only `scripts.test` | `76124c34a1d7110bbe0db5578ee039d79e3c411a1064ae2f0ddeb728fea68f56` |
| Delta `ev_8e5679afc3b6d3667eb09413` | metadata key `scripts.postinstall`, JSON pointer `/scripts/postinstall` | `4afa16baaedb6f645fd2dd33275661afe16974496f33c35765f25402ab3fe069` |

The retained delta has source `null` (absent) and artifact value `HEURISKO_INERT_TEST_ONLY`, whose quoted JSON token occupies bytes `[585,611)` in the mutated manifest. Byte offsets are zero-based and half-open; lines are one-based and inclusive. Preserve each evidence ID in its original bundle. The baseline yields **zero** lifecycle findings; the mutation yields **one**, citing the real delta. M1 currently reports the key as “changed” without resolving retained old/new values. Exact addition direction and contents are established by the producer delta. The current M1 limitation saying command values are not retained is inaccurate for this producer: they are retained but not resolved by this module. Broader wording/module acceptance remains open.

## Independent v12 claim review

Review subject: `experiments/rag/runs/product-qwen-setuptools-live-v12.jsonl` at `e8b8116`, first row's interpretation. A pinned, non-root, read-only, network-disabled Linux parser verified both retained setuptools archives, all four cited excerpt hashes and ranges, the two retained full source copies, and the wheel-only `.pth` inventory observation. No startup hook, setup script, build or product model was executed. The release note was checked against the sdist; no new Git-object or signature verification was performed.

| Claim | Evidence locator | Assessment |
|---|---|---|
| Guard enables import when environment value is absent or `local` | `ev_0af170efa4b01ea3bcc51c54`, wheel `distutils-precedence.pth:1` | Supported as static behavior under normal `.pth` processing; no execution observed |
| Source template contains the same guarded shim call | `ev_538c8c1b965709b1507b36f9`, `setup.py:53–59` | Supported; no artifact-to-commit/build-origin proof |
| `add_shim()` inserts `DISTUTILS_FINDER` into `sys.meta_path` | `ev_d7853a3156a8d2146e64cd2e`, `_distutils_hack/__init__.py:124–125` (retained excerpt 124–131) | Supported source behavior; not independent proof of the wheel implementation |
| Project documents distutils-precedence intent | `ev_2c623c2ce90a481e378d7a27`, `CHANGES.rst:854–856` | Supported as documented intent; no benignness/build-origin proof |

The answer's “confirms ... intended behavior of the setuptools build” must be read only as source-documented intent. Reviewed replacement: “The retained artifact text and candidate source template contain the same guarded shim call; the release note documents its intended compatibility behavior. The exact wheel-to-commit/build binding remains unverified.”

**Do not adopt “SLSA Level 3+” as project policy or a requirement for this case.** The evidence establishes no assurance-level obligation or platform assessment. A signed statement alone does not establish Build L3: [SLSA v1.2 Build Track Basics](https://slsa.dev/spec/v1.2/build-track-basics#build-l3-hardened-builds) also requires platform hardening, isolation between runs and protection of signing material. Reviewed replacement action: “Obtain available provenance for the exact wheel digest; verify the subject, signer/issuer, predicate, source revision and builder against an explicitly reviewed trust policy. Retain unavailable, unsupported or unverified states. Consider an approved isolated reproducibility check separately.” Matching hashes alone do not justify calling a build known-good.

The provenance question's non-abstaining response remains correctly rejected. Four valid citation IDs and regex guards do not prove semantic entailment or universal origin-claim enforcement. The saved v12 run is immutable. No prompt/policy/G0 change or automatic model integration was made. Hosted OpenRouter use in the P04 demo **still requires organizer confirmation**. A fixed provider model ID is not an immutable weight/runtime digest.

## Validation and publication boundary

The isolated exact-head checkout passes frozen offline pnpm installation with `--ignore-scripts` using the existing project store, Node 22.23.4, pnpm 10.14.0, TypeScript 5.8.3, Python 3.13.2 and existing jsonschema 4.26.0. The first default-store attempt lacked the TypeScript tarball; it is not counted as a pass. `pnpm run typecheck`, `pnpm run test:contracts` (including all intelligence validators), ten Python RAG unit tests and local Markdown checks pass. Research checksum validation is recorded in the receipt. No analyzed target was installed.

Reevaluating the saved v12 results yields two questions, Recall@5 1.00, Precision@5 0.80, MRR@5 0.75, citation-ID validity 4/4, safe-gate accuracy 1.00 and raw model abstention accuracy 0.50. The RAG unit tests and saved evaluator used host Python 3.14.7; the contract/intelligence suite used pinned Python 3.13.2. These are saved two-question metrics, not fresh inference or a general accuracy estimate. Three model-off handshakes against unchanged `e8b8116` preserve input bytes, return known citations, and produce lifecycle counts 0/0/1 for esbuild/picocolors/mutation. No product module was promoted into this checkout.

Remote [CI run 41249304087](https://github.com/sumnlikeshane/Heurisko/actions/runs/41249304087) completed successfully on exact head `e8b8116f9960527d0a82e066059d7792c405defe`: both G0 contract checks and Documentation integrity passed. [The local receipt](../examples/malhar-handoff/current/validation.json) and PR description record this separately from local-only fixture validation. PR publication was explicitly authorized; no new commit, push, merge, demo-host approval, deployment, submission or external teammate message follows from this task.
