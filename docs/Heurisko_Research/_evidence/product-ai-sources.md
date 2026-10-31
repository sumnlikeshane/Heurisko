# Product / AI evidence ledger

Retrieved 31 October 2026. Official local event evidence: `official-problems.txt` (DOCX extraction), `official-slides.txt` (all 36 PDF pages). External pages below were read, not merely named; URLs are primary owner sources. Firecrawl succeeded for the first seven pages and initial searches, then exhausted credits; remaining reads used the web search service. No product implementation or inference test was performed.

| Source | Supported observation | Access / limit |
|---|---|---|
| https://github.com/jesseduffield/lazygit | MIT terminal Git UI, install paths for multiple platforms; workflow precedent | Full README/repository via Firecrawl; no Heurisko usability evidence |
| https://github.com/vadimdemedes/ink | MIT React renderer for terminal; Yoga; explicit warning README covers upcoming version; visible recent activity | Full repo/README via Firecrawl; do not equate HEAD with stable npm release |
| https://github.com/vadimdemedes/ink/blob/master/package.json | HEAD 8.0.0, Node >=22, ESM | Web open + find; selected release/React peers still approval-stage verification |
| https://github.com/charmbracelet/bubbletea | MIT Go framework, Elm architecture, visible v2.1.1 commit | Full repo/README via Firecrawl; no integration benchmark |
| https://github.com/ratatui/ratatui | MIT Rust TUI crate, visible current activity | Full repo/README via Firecrawl; no platform test |
| https://github.com/Textualize/textual | MIT Python terminal/browser framework; async; visible October activity | Full repo/README via Firecrawl; does not imply shared React UI |
| https://huggingface.co/Qwen/Qwen3-8B | Apache-2.0, 8.2B, native 32,768 tokens, local runtime support, Transformers >=4.51 architecture support, thinking sampling caveat | Full card via Firecrawl; benchmark claims treated as publisher claims, not package-integrity validation |
| https://huggingface.co/Qwen/Qwen3-4B | Apache-2.0, 4.0B, native 32,768, thinking/non-thinking | Web open `turn10view0`, find `turn13view1`; no inference |
| https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct | Apache-2.0, code-oriented, 7.61B, Transformers architecture requirement | Web open `turn10view1`, find `turn13view2`; no package task score |
| https://ai.google.dev/gemma/docs/core/model_card_4 | Available official Gemma 4 card, Apache-2.0, E4B/E2B effective/total parameter distinction | Web open `turn10view3`; publisher capability claims not independently validated |
| https://docs.ollama.com/capabilities/structured-outputs | JSON schema format with JS/Python validation | Firecrawl and web `turn16view0`; schema ≠ factual truth |
| https://docs.ollama.com/faq | Local-only setting, localhost binding, `ollama ps` GPU visibility, context config | Web `turn16view1`; configuration must be pinned/tested |
| https://docs.ollama.com/macos | macOS 14+, Apple M CPU/GPU support | Web `turn10view2`; no exact M3 performance claim |
| https://ollama.com/library/qwen3:8b | Q4_K_M, ~5.2 GB artifact, displayed digest prefix 500a1f067a9f | Web `turn10view4`; disk size ≠ RAM, full digest needed |
| https://github.com/ggml-org/llama.cpp | MIT C/C++ inference project with build/binary distribution options | Web `turn16view2`; no pinned runtime benchmark |

Important official distinctions: selected-package release monitoring is required by P04; hosted dashboard is optional. P04 accepts open-weight local or organizer-server inference per slide 12; Gemma-only laptop requirement belongs P08. The founder brief excludes closed cloud product inference. Product recommendations, workflows, command structure, support targets, and model contract are engineering proposals, not official requirements or validated user demand.
