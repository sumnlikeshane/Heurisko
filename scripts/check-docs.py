#!/usr/bin/env python3
"""Check repository Markdown links/anchors and the preserved research snapshot.

No network requests or third-party Python packages. App-route links are checked
by apps/web/build.mjs against its actual admitted route/document manifest.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import hashlib
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
AREAS = ("docs", "examples", "apps/web", "integration", "packages", "experiments")
# The intake manifest binds this exact upstream README. Only these two omitted
# experiment destinations are excepted, not every link in the imported package.
UPSTREAM_OMISSIONS = {
    ("packages/intelligence/README.md", "../../experiments/codeastra/README.md"),
    ("packages/intelligence/README.md", "../../experiments/codeastra/results/paired-test-sample-50.json"),
}


def prose(markdown, strip_inline=True):
    """Exclude fenced examples, inline code and HTML comments from link scans."""
    result, fence = [], None
    for line in markdown.splitlines():
        marker = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
        if marker:
            char, length = marker[1][0], len(marker[1])
            if fence is None:
                fence = (char, length)
            elif char == fence[0] and length >= fence[1]:
                fence = None
            result.append("")
        else:
            result.append(line if fence is None else "")
    value = re.sub(r"<!--[\s\S]*?-->", "", "\n".join(result))
    return re.sub(r"(`+)(.*?)\1", "", value) if strip_inline else value


def anchors(markdown):
    """GitHub-style ATX/setext heading slugs, including duplicate suffixes."""
    clean = prose(markdown, strip_inline=False)
    found, counts = set(), {}
    lines = clean.splitlines()
    for index, line in enumerate(lines):
        match = re.match(r"^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$", line)
        title = match[1] if match else None
        if title is None and index + 1 < len(lines) and line.strip() and re.match(r"^\s*(?:=+|-+)\s*$", lines[index + 1]):
            title = line.strip()
        if title is None:
            continue
        title = re.sub(r"!?\[([^\]]+)\]\([^)]+\)", r"\1", title)
        title = re.sub(r"<[^>]+>", "", title).lower()
        slug = re.sub(r"[^\w\- ]", "", title).replace(" ", "-")
        suffix = counts.get(slug, 0)
        counts[slug] = suffix + 1
        found.add(slug + (f"-{suffix}" if suffix else ""))
    # Existing explicit anchors remain valid even without a heading.
    found.update(re.findall(r'<(?:a|h[1-6])\b[^>]*\b(?:id|name)=["\x27]([^"\x27]+)', clean))
    return found


def destinations(markdown):
    clean = prose(markdown)
    refs = {key.strip().casefold(): target.strip("<>") for key, target in re.findall(
        r'^\s{0,3}\[([^\]]+)\]:\s*(<[^>]+>|\S+)', clean, re.M)}
    for match in re.finditer(r'!?\[[^\]]*\]\(\s*(<[^>]+>|(?:\\.|[^\s()])+(?:\([^()]*\)[^\s()]*)*)', clean):
        yield match[1].strip("<>")
    for match in re.finditer(r'!?\[([^\]]+)\]\[([^\]]*)\]', clean):
        key = (match[2] or match[1]).strip().casefold()
        yield refs.get(key, "missing-reference:" + key)
    # Reference definitions are checked even if their use is a shortcut link.
    yield from (value.strip("<>") for value in refs.values())


def markdown_files(root=ROOT):
    # Git's inventory includes candidate files but excludes ignored dependencies,
    # generated dist, private scratch and other worktrees. Deleted paths drop out.
    names = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=root
    ).decode().split("\0")
    return sorted({Path(name) for name in names if name.endswith(".md")
                   and (len(Path(name).parts) == 1 or any(name.startswith(a + "/") for a in AREAS)
                        or name.startswith(".github/")) and (root / name).is_file()})


def check(root=ROOT):
    issues, heading_cache, exceptions = [], {}, set()
    files = markdown_files(root)
    for relative in files:
        source = root / relative
        for raw in destinations(source.read_text(encoding="utf-8")):
            if raw.startswith("missing-reference:"):
                issues.append(f"{relative}: undefined link reference {raw.split(':', 1)[1]}")
                continue
            if (relative.as_posix(), raw) in UPSTREAM_OMISSIONS:
                exceptions.add((relative.as_posix(), raw))
                continue
            parsed = urlsplit(raw)
            if parsed.scheme or parsed.netloc:
                continue
            target = unquote(parsed.path)
            # Absolute app UI routes appear only in authored web content; the
            # web build validates every declared route AND heading, using source.
            if target.startswith("/") and relative.as_posix().startswith("apps/web/content/"):
                if target == "/" or target.startswith(("/docs/", "/workspace/")):
                    continue
            destination = (source.parent / target).resolve() if target else source.resolve()
            if not destination.is_relative_to(root.resolve()) or not destination.exists():
                issues.append(f"{relative}: missing local target {raw}")
                continue
            if parsed.fragment and destination.suffix.lower() == ".md":
                if destination not in heading_cache:
                    heading_cache[destination] = anchors(destination.read_text(encoding="utf-8"))
                if unquote(parsed.fragment) not in heading_cache[destination]:
                    issues.append(f"{relative}: missing anchor in {raw}")
    manifest = root / "docs/Heurisko_Research/SHA256SUMS.txt"
    research_count = 0
    for line in manifest.read_text().splitlines():
        research_count += 1
        expected, name = line.split(maxsplit=1)
        file = manifest.parent / name.strip().lstrip("*")
        if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest() != expected:
            issues.append(f"Research snapshot checksum mismatch: {name}")
    if issues:
        print("\n".join(issues), file=sys.stderr)
        return 1
    print(f"Checked {len(files)} Markdown files and {research_count} research hashes; {len(exceptions)} exact upstream omitted-experiment links excepted.")
    return 0


if __name__ == "__main__":
    raise SystemExit(check())
