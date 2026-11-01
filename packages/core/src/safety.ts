// Versioned controls for the first local/public static evidence slice.
export const safetyProfile = {
  version: 'heurisko-static-v5',
  network: {
    schemes: ['https'], hosts: ['registry.npmjs.org', 'codeload.github.com', 'api.github.com'],
    port: 443, redirects: 3, timeoutMs: 30_000, idleTimeoutMs: 10_000,
    metadataBytes: 4 * 1024 * 1024, metadataParseBytes:256 * 1024,
    rejectCredentials: true, rejectIPLiteral: true,
    requireAllResolvedAddressesPublic: true, pinValidatedAddressPerConnection: true,
    revalidateEveryRedirect: true, rejectProxyEnvironment: true,
  },
  archive: {
    compressedBytes: 32 * 1024 * 1024, expandedBytes: 128 * 1024 * 1024,
    memberBytes: 16 * 1024 * 1024, entries: 10_000, pathBytes: 1024,
    pathDepth: 32, nestedArchives: 0, supportedEntries: ['regular-file', 'directory'],
    rejectLinksSpecialEntriesDuplicatesAndCaseCollisions: true, virtualInventory: true,
  },
  parser: { cpuSeconds: 10, memoryBytes: 256 * 1024 * 1024, wallMs: 30_000, concurrency: 1, queueDepth: 8,
    createTimeoutMs:30_000,controlTimeoutMs:10_000,outputFileMode:0o644,privateJobMode:0o700,
    runtime:'digest-pinned-linux-container',
    image:'python:3.13.18-slim-bookworm@sha256:281d39ff02e3b389401586134ff9e6572954687822a58055ec07a60ded4e0b7f',
    network:'none',rootFilesystem:'read-only',pids:16,user:'65534:65534',noHostFallback:true },
  validation: { inputBytes: 8 * 1024 * 1024, outputBytes: 4096, wallMs: 10_000, jsonDepth: 100 },
  analysis: { timeoutMs: 30_000 },
  storage: { relativeRoot: '.heurisko', capBytes: 1024 * 1024 * 1024, reserveBytes: 64 * 1024 * 1024, automaticEviction: false, retention: 'until-explicit-deletion', fullDisk: 'fail-write-preserve-previous', immutableKey: 'full-content-sha256' },
  source: { tagRepositories:3, tagPrefixes:['v',''], tagPeelLimit:4, acquisition: 'immutable-https-archive-only', gitEnabled: false, submodules: false, lfs: false },
  execution: { targetScripts: false, rebuild: 'unavailable' },
} as const;
