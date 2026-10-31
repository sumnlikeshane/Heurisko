// Build-time admission list and inert documentation helpers. No remote index.
export const docPages = [
 ['start/quickstart','Start','First investigation'], ['setup','Start','Installation and execution'],
 ['cli/analyze','CLI reference','Analyze'], ['cli/inspect','CLI reference','Inspect'], ['cli','CLI reference','Complete CLI reference'],
 ['workflows/npm','Browser workflows','Exact npm release'], ['workflows/local','Browser workflows','Local archive and source replay'],
 ['workflows/evidence','Browser workflows','Explore evidence'], ['workflows/portable','Browser workflows','Export and reopen'], ['workflows/ci','Browser workflows','Reports in CI'],
 ['concepts/identity','Concepts','Identity, evidence and limits'], ['troubleshooting/session','Troubleshooting','Connection and session'],
 ['troubleshooting/errors','Troubleshooting','Input, engine and import errors'], ['availability','Availability','Current capabilities'], ['browser','Availability','Complete browser guide']
] as const;
export type DocId = typeof docPages[number][0];
export type DocPage = { id: DocId; group: string; title: string; markdown: string; source: string };
export function headingId(text: string) { return text.toLowerCase().replace(/[`*]/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '-'); }
export function headings(text: string) {
 const used = new Map<string, number>(); let fence = '';
 return text.split('\n').flatMap((line, index) => {
  const f = /^(```|~~~)/.exec(line); if (f) { fence = fence ? '' : f[1]!; return []; } if (fence) return [];
  const m = /^(#{1,6}) (.+)$/.exec(line); if (!m) return [];
  const base = headingId(m[2]!), n = used.get(base) ?? 0; used.set(base, n + 1);
  return [{ line: index, level: m[1]!.length, text: m[2]!, id: base + (n ? '-' + n : '') }];
 });
}
export function docLink(url: string, page: DocId): string | null {
 if (/^https:\/\//.test(url)) { try { const u = new URL(url); return !u.username && !u.password ? u.href : null; } catch { return null; } }
 const [rawPath, anchor] = url.split('#');
 let name: string | undefined; try { name=decodeURIComponent(rawPath ?? '').split('/').at(-1); } catch { return null; }
 const known = name === 'CLI Reference.md' ? 'cli' : name === 'README.md' && /apps\/web|^README.md$/.test(rawPath ?? '') ? 'browser' : name === 'README.md' && anchor === 'installation-and-execution' ? 'setup' : null;
 if(known) return '/docs/' + known + (anchor ? '#' + anchor : '');
 if (url.startsWith('#')) return '/docs/' + page + url;
 const path = url.split('#')[0];
 return docPages.some(([id]) => path === '/docs/' + id) ? url : null;
}
export function searchDocs(pages: readonly DocPage[], query: string) {
 const q = query.trim().toLowerCase(); if (!q) return [];
 return pages.flatMap(page => {
  const hs = headings(page.markdown); const lines = page.markdown.split('\n');
  return hs.flatMap((h, i) => {
   const text = lines.slice(h.line, hs[i + 1]?.line).join('\n'); const at = text.toLowerCase().indexOf(q);
   return at < 0 ? [] : [{ page: page.id, title: page.title, section: h.text, anchor: h.id, snippet: text.slice(Math.max(0, at - 65), at + q.length + 130).replace(/\s+/g, ' ') }];
  });
 }).slice(0, 100);
}
