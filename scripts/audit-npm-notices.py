"""Inventory installed npm package license/notice files without reading package code."""

import hashlib
import json
from pathlib import Path


root = Path(__file__).resolve().parent.parent
inventory = json.loads((root / "docs/production-phase1/npm-licenses.json").read_text())
wanted = {(item["name"], item["version"]) for item in inventory["items"]}
store = root / "node_modules/.pnpm"
package_jsons = list(store.glob("*/node_modules/*/package.json"))
package_jsons += list(store.glob("*/node_modules/@*/*/package.json"))
found = {}

for path in package_jsons:
    try:
        package = json.loads(path.read_text())
    except (OSError, ValueError):
        continue
    key = (package.get("name"), package.get("version"))
    if key not in wanted:
        continue
    files = []
    for candidate in sorted(path.parent.resolve().iterdir()):
        if not candidate.is_file():
            continue
        if not any(word in candidate.name.lower() for word in ("license", "licence", "notice", "copying")):
            continue
        content = candidate.read_bytes()
        files.append(
            {
                "name": candidate.name,
                "bytes": len(content),
                "sha256": hashlib.sha256(content).hexdigest(),
            }
        )
    found[key] = {
        "name": key[0],
        "version": key[1],
        "declared_license": package.get("license"),
        "top_level_rights_files": files,
    }

if set(found) != wanted:
    raise SystemExit(f"Missing installed package directories: {sorted(wanted - set(found))}")

result = {
    "version": "heurisko-phase1-npm-notice-audit-v1",
    "scope": "macOS arm64 installed pnpm package directories; top-level LICENSE/LICENCE/NOTICE/COPYING files only",
    "package_count": len(found),
    "packages_with_top_level_rights_file": sum(bool(item["top_level_rights_files"]) for item in found.values()),
    "packages": sorted(found.values(), key=lambda item: (item["name"], item["version"])),
}
print(json.dumps(result, indent=2, ensure_ascii=False))
