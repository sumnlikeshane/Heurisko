# Real package/source evaluation case: setuptools 60.0.0

**Dataset kind:** manually curated public real-package case; not training data.
**Use:** evaluate evidence retrieval and bounded explanation of a generated
startup hook. No package code or build step was executed.

## Acquired records

- PyPI wheel: [`setuptools-60.0.0-py3-none-any.whl`](setuptools-60.0.0-py3-none-any.whl),
  SHA-256 `75fd345a47ce3d79595b27bf57e6f49c2ca7904f3c7ce75f8a87012046c86b0b`.
- PyPI source distribution: [`setuptools-60.0.0.tar.gz`](setuptools-60.0.0.tar.gz),
  SHA-256 `5ec2bbb534ed160b261acbbdd1b463eb3cf52a8d223d96a8ab9981f63798e85c`.
- Source repository: `https://github.com/pypa/setuptools`, tag `v60.0.0`,
  resolved with `git ls-remote` to commit
  `9288c6f3f039bf51f997a99ae8766ed02ed92cda`. The sdist's `setup.py` and
  `_distutils_hack/__init__.py` are byte-identical to files fetched from that
  immutable commit; those source files are preserved under [`source/`](source/).
- PyPI release metadata lists the artifact URLs and SHA-256 digests in
  [the release JSON](https://pypi.org/pypi/setuptools/60.0.0/json).

## Observed difference and expected explanation

The wheel contains `distutils-precedence.pth`; the source distribution has no
member with that path. The release source's `setup.py` builds the file from a
template, converts its lines to a single `.pth` line, and places it in the
distribution. The resulting hook checks `SETUPTOOLS_USE_DISTUTILS` and, when
its value is `local` (the default), calls `_distutils_hack.add_shim()`. That
function inserts `DISTUTILS_FINDER` into `sys.meta_path`, preferring
setuptools' bundled distutils. The release notes describe the compatibility
behavior and the `stdlib` override.

This is a behavior-bearing generated file with an ordinary, documented
packaging explanation. It is not evidence of malicious intent. The package
hash and source tag are recorded, but this case does **not** independently
verify a provenance attestation binding the exact wheel bytes to the commit;
the model must not claim that it does.

`manifest.json` records artifact/source identities and hashes. The
`documents.jsonl` excerpts retain IDs, paths, line ranges, and source locators.
`queries.jsonl` contains the model-visible questions. The answer key in
`oracle/judgments.jsonl` is separate and must not be loaded by the retriever or
model. The original distribution is MIT-licensed; see the included `LICENSE`.

## Sources

- [PyPI release metadata and artifact hashes](https://pypi.org/pypi/setuptools/60.0.0/json)
- [Immutable release source: setup.py](https://github.com/pypa/setuptools/blob/9288c6f3f039bf51f997a99ae8766ed02ed92cda/setup.py)
- [Immutable release source: distutils shim](https://github.com/pypa/setuptools/blob/9288c6f3f039bf51f997a99ae8766ed02ed92cda/_distutils_hack/__init__.py)
- [Setuptools v60.0.0 release notes](https://github.com/pypa/setuptools/blob/9288c6f3f039bf51f997a99ae8766ed02ed92cda/CHANGES.rst)
- [PyPA packaging guide: wheel and source distribution roles](https://packaging.python.org/en/latest/discussions/package-formats/)
