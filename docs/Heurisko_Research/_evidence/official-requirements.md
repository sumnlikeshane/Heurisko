# Heurisko — authoritative organizer requirement map

Research date: 31 October 2026. Status: extraction of supplied organizer documents; technical interpretations are identified separately. Both documents were read completely. PDF pages 19 and 28 were also rendered and inspected visually.

## Sources and authority

- **O-DOCX:** [Hacktoberfest 2026 (1)(2).docx](https://chatgpt.com/library?file_id=libfile_e47bf0c298c8819190015bb65cf9c60d&account_id=personal), “Official Problem Statements & Development Guidelines.” References below use its numbered sections and problem headings.
- **O-PDF:** [Hacktoberfest HackDay Sonipat(1).pdf](https://chatgpt.com/library?file_id=libfile_468585bf71188191b6571352bc2f0c75&account_id=personal), 36 pages. References below use one-based PDF page numbers.
- **F-PROMPT:** [Pasted text(1).txt](https://chatgpt.com/library?file_id=libfile_a4092e6d15c08191870a97f1229bc4f8&account_id=personal), founder research assignment. This is authorization to research and create the dossier, explicitly excluding product implementation and repository mutation.

The organizer documents establish event obligations. Founder hypotheses FH-01 and FH-02 are proposals, not organizer requirements. Architectural choices in the dossier remain proposals.

## P04 exact scope, preserved as testable requirements

| ID | Official capability | Source | Architectural consequence (recommendation) |
|---|---|---|---|
| O04-01 | Retrieve published packages from npm **or** PyPI. | O-DOCX, §2 Problem 04, “The system should” | Supporting both is a product expansion, not an event minimum. Design ecosystem adapters; name the delivered support explicitly. |
| O04-02 | Identify and retrieve corresponding source code. | Same | Source revision resolution needs evidence, uncertainty and explicit monorepo subdirectory handling. |
| O04-03 | Compare source files with distributed package contents. | Same | Preserve raw artifact/source bytes and hashes; report per-file correspondence and mismatches. |
| O04-04 | Identify generated files and normal build artifacts. | Same | A generated-looking path is insufficient proof; explanations need recipes, source maps or rebuild evidence. |
| O04-05 | Detect unexpected or suspicious modifications. | Same | Inspect manifest scripts and unexplained executable additions alongside general differences. |
| O04-06 | Explain why individual differences exist. | Same; O-PDF p28 | Every analyzed difference receives an evidence-backed explanation or explicit unresolved status. |
| O04-07 | Provide a risk assessment supported by evidence. | O-DOCX, §2 Problem 04 | Use findings/severity/evidence and uncertainty; no unsupported universal “safe” guarantee. |
| O04-08 | Monitor new releases of selected packages. | Same | Basic release monitoring belongs in the complete P04 deliverable. Hosted watchlists and notification channels can be later enhancements. |

**Underlying problem:** reviewed repositories and distributed artifacts may differ because of ordinary build/release steps or unauthorized modifications. The hard part is interpreting differences. The organizer cites the XZ backdoor and September 2025 npm compromises as research starting points, not as required supported ecosystems or a requirement to execute malware. (O-DOCX, §2 Problem 04.)

**Expected deliverable:** a working supply-chain verification tool comparing repository source and published packages, explaining differences and identifying suspicious modifications. (O-DOCX, §2 Problem 04.)

**Evaluation inputs:** recent real-world releases, mainly legitimate differences, plus organizer-prepared tampered package copies. The documents provide no package list, hidden-test API, required command syntax, exact source-resolution success threshold or false-positive budget. These are open interface/evaluation questions, not permission to invent passing results. (O-DOCX, §2 Problem 04.)

**Technical questions explicitly raised:** distinguish normal build-generated differences from malicious modifications; avoid an ever-growing hardcoded exception list; verify provenance; extend ecosystems without redesigning the engine; automatically monitor new releases. (O-DOCX, §2 Problem 04.)

**Slide 28 scenarios:** `src/index.ts` → `dist/index.js` is illustrated as expected compiled output; `package.json` gains `postinstall`, illustrated as suspicious; `lib/x.min.js` appears obfuscated and absent from the repository, illustrated as suspicious. These are demonstrations of reasoning, not permission to classify all generated files benign or all minified files malicious. O-PDF p28 does not establish that matching version labels prove matching source revisions.

## AI requirements: P04 is not P08

| Rule | Scope and source | Consequence |
|---|---|---|
| Meaningful open-source or open-weight model work in the product | O-DOCX §6; O-PDF p12 | Deterministic comparison alone does not satisfy meaningful AI use. Provide actual integrated inference and demonstrate its contribution. |
| Open-weight models may run locally or on organizer model server | O-PDF p12 | P04 does not require laptop-only inference. Availability/model list is announced at briefing and is not supplied in these files. |
| Closed APIs receive zero AI-use points and cannot run on keyless test machines | O-PDF p12 | The founder prompt is stricter: no closed cloud APIs in the submitted inference architecture. Follow the stricter project direction. |
| Name each model and why in HACKATHON.md; false model claims score zero AI-use and minus five overall | O-PDF pp12,19; O-DOCX §6 | Record exact actual integration; never list aspirational models as used. |
| Coding assistants allowed; disclose in PRs | O-PDF pp12,14; O-DOCX §§4.3,5 | Development assistance and the product's inference architecture are separate declarations. |
| Gemma only, all inference on laptop, no cloud fallback, mentor checks, disqualification for other models/cloud | **P08 only**, O-DOCX §3; O-PDF pp32–33 | Do not impose P08-only restrictions on P04. |

The organizer model names and commands are organizer claims, not independent verification of model availability. Model selection requires checking the actual distribution, license and runtime separately.

## Repository and evidence obligations

| ID | Official rule | Source |
|---|---|---|
| O-REPO-01 | New, empty public GitHub repository; no earlier code/prototype. | O-DOCX §§4,6; O-PDF pp10,15 |
| O-REPO-02 | First commit contains **only HACKATHON.md**: team name, all member names, selected problem, models used and reasons. | O-DOCX §4.1; O-PDF pp11,14 |
| O-REPO-03 | All subsequent changes through PRs, no direct main pushes; each PR passes CI, describes changes/testing and discloses product models plus coding assistants. Solo contributors may merge their own PRs. | O-DOCX §§4.3,5; O-PDF p14 |
| O-REPO-04 | MIT or Apache-2.0 LICENSE, README installation/execution, mandatory PR template, `.github/workflows/ci.yml`, examples/. | O-DOCX §4.2 table, §§4.4–5; O-PDF pp13,15 |
| O-REPO-05 | CI installs dependencies, runs relevant tests and validates implementation on every PR; final commit must pass. | O-DOCX §4.4; O-PDF pp13–14 |
| O-REPO-06 | examples/ includes representative input, **actual generated output**, and supporting files. No stubs or fabricated output. | O-DOCX §4.5; O-PDF p13 |
| O-REPO-07 | Public data only; never publish automated issues or comments on real OSS projects; caution with external contributor code. | O-DOCX §6 |
| O-REPO-08 | No API keys/secrets; every member must explain implementation, any member may be questioned. | O-DOCX §6; O-PDF pp13,15,18–19 |

Practical ordering: create only HACKATHON.md in initial commit, then add license/scaffold/CI/docs through the first PR. The generic slide instruction “repo with an open-source license” does not override the more precise first-commit-only instruction. This research does not create a repository or prebuild implementation code. Reusing existing open-source dependencies is distinguishable from submitting a prior prototype; confirm any unusually large imported codebase with organizers before treating it as original work.

## Presentation and judging

- Eight-minute pitch, four-minute Q&A, two-minute buffer; show a live demo, how it works, models/tools and learning. Any team member can be questioned. (O-PDF p18.)
- Automated categories: Functional Correctness, Open-Source AI Use, Testing & Evidence, Open-Source Workflow (PRs/CI). Panel categories: Design & Trade-offs Q&A, Live Demo & Usability, Problem Understanding. (O-PDF p19.)
- **Source defect:** page 19 literally displays `00` in all weight/total positions, confirmed by visual rendering. The bars imply relative emphasis but do not establish exact numbers. Exact full weights cannot be recovered from this file.
- Separately explicit numerical statements: AI use up to 15 (p12), workflow 10 (p14), overall 100 and Functional Correctness 30 in P08 judging clarification (p33, described as the same scoring). The latter is supporting evidence for the shared correctness weight, not a replacement for a complete readable rubric. Other weights remain unverified. Do not invent an “automated 70 / panel 30” table.
- Public repository/license and the ability of any member to explain code are must-pass conditions. (O-PDF p19.)

## Event times and source gaps

All dates/times below are event-local India time (Asia/Kolkata), inferred from the Sonipat venue; the files do not spell out a timezone.

- Start: 31 October 2026 18:30; repo link and init commit: 20:30. (O-PDF pp9–11,16; O-DOCX §4.1.)
- Last merge/push and repository freeze: 1 November 2026 06:30. Presentation: 08:30. OrganizerHQ submission: 06:30, one submission for the whole team, teammates added afterwards. (O-PDF pp10–11,16,18,20–21.)
- Problems 1–7 compete for top three prizes; Problem 8 only Gemma prize. P04 selects “Best Open-Source AI Project”; P08 additionally selects “Best Use of Gemma 4.” (O-PDF pp20,22; O-DOCX §3.)
- The founder excludes the 12-hour limit from technical difficulty/product planning. Keep event deadlines as facts; do not use them to quietly remove product capabilities.

Unresolved organizer evidence: full numerical rubric; hidden-test interface/packages; server model list, runtime/API access and availability; interpretation of “no earlier code” for imported research/helper fixtures; exact requirements for monitoring during automated tests; whether a locally running API/web viewer is expected on evaluation machines. These gaps do not block unrelated research.
