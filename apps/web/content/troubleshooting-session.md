# Connection and session

## Unauthorized: SESSION_DENIED

Public Home and docs still work. Restore access using the private launch URL from this exact reader in the masked connection field. The field clears immediately; authority remains only in memory. Destination URLs and saved reports contain no capability. Never paste the private URL into a report or issue.

## Disconnected or status uncertain

Check that the loopback reader is still running. Refresh session status performs read-only requests; it never starts or retries analysis. Old progress is last observed, not current completion. Closing a tab does not cancel. Cancellation is an explicit abort request and cleanup remains not_observable.

## Expired handles after restart

Jobs and observations belong to one process. A new process cannot resume an old execution handle. Explicitly [open saved evidence](../README.md#saved-report-and-portable-browser-import) with report/portable bytes or a report content reference in this workspace store. No automatic retry, recovery or deletion occurs.

## Next task

[Export/reopen guide](workflows-portable.md), [input/engine/import errors](troubleshooting-errors.md) or [quickstart](start-quickstart.md).
