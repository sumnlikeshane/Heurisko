# Export and reopen

## Choose an output

| Format | Contains | Reopen |
|---|---|---|
| Report JSON | Original validated report bytes and references | Select Report JSON; uses only workspace evidence |
| Bundle JSON | Shared EvidenceBundle, without the enclosing report | Not a report import; keep with the report |
| Portable .heurisko.json | Original report plus retained blobs, manifest and omissions | Select Portable evidence |

## Steps

1. Open a selected report and expand Export this observation. Check its original report content reference and capture time.
2. Select a format and prepare a download. The browser initiates downloading; the app cannot confirm a filesystem save.
3. In Open evidence choose the matching format and explicitly select the saved file. Portable imports validate report/blob digests and omission declarations.
4. Compare the original content reference after reopening. Capture time stays historical; export time is separate.

## Limits and recovery

Portable envelopes are bounded at 100 MiB with at most 64 MiB included blobs. Missing/oversized/unavailable blobs remain omissions. Upstream redistribution rights still apply; nothing is published automatically. Wrong-format, corruption or validation failure never falls back to an unchecked report. Report-only MISSING_BLOB needs matching startup report/store admission or a portable export with bytes. A content digest reopens only reports in the fixed workspace store, not arbitrary files.

See [browser transport details](../README.md#portable-directory-export-and-import), [errors](troubleshooting-errors.md) and [Open evidence](../README.md#saved-report-and-portable-browser-import).
