// Bounded text scan of present Git tracked/candidate files. Never prints values.
// Ignored/private files, archives, extensionless CAS blobs and arbitrary secret
// formats are outside coverage; this does not certify absence of credentials.
import { execFileSync } from 'node:child_process';
import { readFileSync, lstatSync } from 'node:fs';
import { basename, extname } from 'node:path';
const names = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { maxBuffer: 16 * 1024 * 1024 })
  .toString('utf8').split('\0').filter(Boolean);
const extensions = new Set(['.md', '.json', '.jsonl', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.py', '.log', '.env', '.yaml', '.yml', '.txt', '.toml', '.ini', '.cfg', '.sh']);
const patterns = new Map([
  ['OpenRouter key', /sk-or-v1-[A-Za-z0-9]{20,}/],
  ['AWS access key ID', /AKIA[0-9A-Z]{16}/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9]{30,}/],
  ['GitHub fine-grained token', /github_pat_[A-Za-z0-9_]{30,}/],
  ['private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
]);
const failures = [], coverage = { checked: 0, bytes: 0, missing: 0, excludedType: 0, nonregular: 0, byExtension: {} };
for (const name of [...new Set(names)].sort()) {
  let info;
  try { info = lstatSync(name); } catch (error) { if (error.code === 'ENOENT') { coverage.missing++; continue; } throw error; }
  if (!info.isFile()) { coverage.nonregular++; continue; }
  const extension = extname(name);
  if (!extensions.has(extension) && !basename(name).startsWith('.env') && !['Dockerfile', 'Dockerfile.render', '.npmrc', '.pnpmfile.cjs', '.gitignore', '.dockerignore'].includes(basename(name))) { coverage.excludedType++; continue; }
  if (info.size > 8 * 1024 * 1024) throw Error(`TEXT_SCAN_SIZE_LIMIT: ${name}`);
  const value = readFileSync(name, 'utf8');
  coverage.checked++; coverage.bytes += info.size;
  coverage.byExtension[extension || '(configuration)'] = (coverage.byExtension[extension || '(configuration)'] ?? 0) + 1;
  for (const [label, pattern] of patterns) if (pattern.test(value)) failures.push({ path: name, format: label });
}
process.stdout.write(JSON.stringify({ scope: 'present Git tracked/candidate text; ignored files and unsupported types excluded', coverage, matches: failures }, null, 2) + '\n');
if (failures.length) process.exitCode = 1;
