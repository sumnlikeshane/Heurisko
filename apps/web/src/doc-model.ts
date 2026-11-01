// Build-time admission list and inert documentation helpers. No remote index.
export const docPages = [
 ['start/quickstart','Start here','First investigation'], ['setup','Start here','Installation and execution'], ['browser','Start here','Use the browser workspace'],
 ['workflows/npm','Task guides','Exact npm release'], ['workflows/local','Task guides','Local archive and source replay'],
 ['workflows/evidence','Task guides','Explore evidence'], ['workflows/portable','Task guides','Save and reopen'], ['workflows/ci','Task guides','Reports in CI'],
 ['cli/analyze','Command reference','Analyze'], ['cli/inspect','Command reference','Inspect'], ['cli','Command reference','Complete CLI reference'],
 ['concepts/identity','Concepts','Identity, evidence and limits'], ['troubleshooting/session','Troubleshooting','Connection and session'],
 ['troubleshooting/errors','Troubleshooting','Input, engine and import errors'], ['availability','Reference','Current capabilities'], ['reference/browser','Reference','Browser technical reference']
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
 const known = name === 'CLI Reference.md' ? 'cli' : name === 'README.md' && /apps\/web|^README.md$/.test(rawPath ?? '') ? 'reference/browser' : name === 'README.md' && anchor === 'installation-and-execution' ? 'setup' : null;
 if(known) return '/docs/' + known + (anchor ? '#' + anchor : '');
 if (url.startsWith('#')) return '/docs/' + page + url;
 const path = url.split('#')[0];
 return docPages.some(([id]) => path === '/docs/' + id) ? url : null;
}
export function searchDocs(pages: readonly DocPage[], query: string) {
 const q = query.trim().toLocaleLowerCase(); if (!q || q.length > 256) return [];
 const terms = [...new Set(q.match(/"[^"]+"|\S+/g)?.map(term => term.replace(/^"|"$/g, '').trim()).filter(Boolean) ?? [])];
 if (!terms.length) return [];
 const matches = pages.flatMap((page, pageIndex) => {
  const hs = headings(page.markdown); const lines = page.markdown.split('\n');
  return hs.flatMap((h, i) => {
   const text = lines.slice(h.line, hs[i + 1]?.line).join('\n'), normalized = text.toLocaleLowerCase();
   const positions = terms.map(term => normalized.indexOf(term));
   if (positions.some(at => at < 0)) return [];
   // Distant terms must not turn an excerpt into the entire section. Keep
   // every matched term with bounded context, merging overlapping windows.
   const context = Math.min(90, Math.max(0, Math.floor((640 - terms.reduce((n,t)=>n+t.length,0) - 3*(terms.length+1)) / (2*terms.length))));
   const ranges = positions.map((at,n)=>({start:Math.max(0,at-context),end:Math.min(text.length,at+terms[n]!.length+context)})).sort((a,b)=>a.start-b.start);
   const merged: {start:number;end:number}[] = [];
   for(const range of ranges){const previous=merged.at(-1);if(previous&&range.start<=previous.end+3)previous.end=Math.max(previous.end,range.end);else merged.push({...range});}
   const snippet = (merged[0]!.start ? '…' : '') + merged.map(range=>text.slice(range.start,range.end).replace(/\s+/g,' ')).join(' … ') + (merged.at(-1)!.end < text.length ? '…' : '');
   const title = (page.title + ' ' + h.text).toLocaleLowerCase();
   const score = positions.reduce((sum, at, n) => sum + (at === 0 ? 12 : 0) + (title.includes(terms[n]!) ? 8 : 0) + (normalized.split(terms[n]!).length - 1), 0);
   return [{ page: page.id, title: page.title, section: h.text, anchor: h.id, snippet, score, pageIndex, sectionIndex: i }];
  });
 });
 return matches.sort((a, b) => b.score - a.score || a.pageIndex - b.pageIndex || a.sectionIndex - b.sectionIndex).slice(0, 100).map(({ score: _score, pageIndex: _pageIndex, sectionIndex: _sectionIndex, ...result }) => result);
}
