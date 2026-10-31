# Input, engine and import errors

## Input rejected before start

INVOCATION_INVALID, NPM_EXACT_VERSION_REQUIRED and NPM_NAME_REJECTED require an exact supported target and paired source/commit. Review errors identify fields before upload; server/core remain authoritative. UPLOAD_NAME_INVALID forbids separators/control characters. UPLOAD_LIMIT requires a nonempty file within its stated limit. Fix the draft then review again; nothing retries automatically.

## Acquisition and engine failures

No usable report means exit 3. A retained acquisition diagnostic sha256 reference is not a report to import. Parser unavailable/isolation failure never runs target code on the host. ANALYSIS_MODULE_UNAVAILABLE, zero findings and exit 2 indicate current limits; examine raw differences and Coverage. Cancellation requested does not prove cleanup.

## Import and evidence errors

BLOB_HASH_MISMATCH, REPORT_HASH_MISMATCH, PORTABLE_INVALID or validation failure: select the correct unmodified export; never bypass validation. A standalone bundle is not a report. MISSING_BLOB: reopen a portable export with bytes or restart with explicitly matching report/store pairs. READ_LIMIT and INVALID_RANGE are bounded-reader limits, not clean evidence. Limits/busy/capacity errors require waiting for settlement or selecting a bounded input; there is no automatic eviction or retry.

## Next task

[Full CLI error reference](../../../docs/CLI%20Reference.md#common-errors-and-troubleshooting), [connection help](troubleshooting-session.md), [portable workflows](workflows-portable.md).
