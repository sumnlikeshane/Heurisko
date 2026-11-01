import { AppLink } from './link.js';
import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { scrollDocAnchor } from './navigation.js';
import { safe } from './api.js';
import { docPages, headings, docLink, searchDocs, type DocId, type DocPage } from './doc-model.js';
export function CodeBlock({ text }: { text: string }) {
 const [message, setMessage] = useState('');
 async function copy(){try{if(!navigator.clipboard)throw Error('UNAVAILABLE');await navigator.clipboard.writeText(text);setMessage('Copied exact code text.');}catch{setMessage('Clipboard unavailable. Select and copy the text below.');}}
 return <div className="code-block"><button onClick={() => void copy()}>Copy code</button><span role="status">{message}</span><pre className="byte-content" tabIndex={0}><code>{safe(text, true)}</code></pre></div>;
}
function inline(text: string, page: DocId): React.ReactNode[] {
 return text.split(/(`[^`]+`|\*\*[^*]+\*\*|!?\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part,i) => {
  if(part.startsWith('`')) return <code key={i}>{safe(part.slice(1,-1))}</code>;
  if(part.startsWith('**')) return <strong key={i}>{safe(part.slice(2,-2))}</strong>;
  const m=/^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
  if(m) { const href = m[2]!.startsWith('/workspace/') && /^\/workspace\/(new|open)$/.test(m[2]!) ? m[2] : docLink(m[2]!,page); return href ? <AppLink key={i} href={href} {...(href.startsWith('https:') ? {target:'_blank',rel:'noreferrer noopener'} : {})}>{safe(m[1]!)}</AppLink> : <span key={i}>{safe(m[1]!)} <small>(repository reference: {safe(m[2]!)})</small></span>; }
  return <React.Fragment key={i}>{safe(part)}</React.Fragment>;
 });
}
// Admitted Markdown subset only: no HTML, image, embed, style or script interpretation.
export function Markdown({ text, page = 'cli' }: { text: string; page?: DocId }) {
 const lines=text.split('\n'), hs=new Map(headings(text).map(h=>[h.line,h])), nodes: React.ReactNode[]=[];
 for(let i=0;i<lines.length;i++) {
  const line=lines[i]!, h=hs.get(i);
  if (/^(```|~~~)/.test(line)) { const fence=line.slice(0,3),code:string[]=[]; while(++i<lines.length&&!lines[i]!.startsWith(fence))code.push(lines[i]!); nodes.push(<CodeBlock key={page+':'+i} text={code.join('\n')}/>); }
  else if(h) nodes.push(React.createElement('h'+h.level,{key:i,id:h.id,tabIndex:-1},inline(h.text,page)));
  else if(line.startsWith('|')) { const rows=[line];while(lines[i+1]?.startsWith('|'))rows.push(lines[++i]!);const cells=rows.filter(r=>!/^\|[\s:|-]+\|$/.test(r)).map(r=>r.slice(1,-1).split('|'));nodes.push(<div className="doc-table" key={i} tabIndex={0} role="region" aria-label="Reference table"><table><thead><tr>{cells[0]?.map((c,k)=><th key={k} scope="col">{inline(c.trim(),page)}</th>)}</tr></thead><tbody>{cells.slice(1).map((row,j)=><tr key={j}>{row.map((c,k)=><td key={k}>{inline(c.trim(),page)}</td>)}</tr>)}</tbody></table></div>); }
  else if(/^\s*(?:- |\d+\. )/.test(line)) {const ordered=/^\s*\d+\. /.test(line),items=[line];while(lines[i+1]&& (ordered ? /^\s*\d+\. / : /^\s*- /).test(lines[i+1]!))items.push(lines[++i]!);const children=items.map((s,j)=><li key={j}>{inline(s.replace(/^\s*(?:- |\d+\. )/,''),page)}</li>);nodes.push(ordered?<ol key={i}>{children}</ol>:<ul key={i}>{children}</ul>);}
  else if(line.trim()) nodes.push(<p key={i}>{inline(line,page)}</p>);
 }
 return <div className="documentation">{nodes}</div>;
}
function highlighted(text: string, query: string) {
 const terms = [...new Set(query.match(/"[^"]+"|\S+/g)?.map(value => value.replace(/^"|"$/g, '').trim()).filter(Boolean) ?? [])].sort((a, b) => b.length - a.length);
 if (!terms.length) return safe(text);
 const pattern = new RegExp('(' + terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig');
 return text.split(pattern).filter(Boolean).map((part, index) => terms.some(term => part.toLocaleLowerCase() === term.toLocaleLowerCase()) ? <mark key={index}>{safe(part)}</mark> : <React.Fragment key={index}>{safe(part)}</React.Fragment>);
}
export function Documentation({ doc = 'start/quickstart' }: { doc?: DocId }) {
 const [docs, setDocs] = useState<DocPage[]>([]), [query, setQuery] = useState(''), [error, setError] = useState(''), [retry, setRetry] = useState(0);
 const [loading, setLoading] = useState(true), [activeSection, setActiveSection] = useState('');
 const layout = useRef<HTMLDivElement>(null), article = useRef<HTMLDivElement>(null), sidebar = useRef<HTMLElement>(null), search = useRef<HTMLInputElement>(null);
 const positions = useRef(new Map<DocId, number>()), sidebarPosition = useRef(0);
 const clearSearch = () => { setQuery(''); search.current?.focus(); };
 useEffect(() => {
  const controller = new AbortController();
  const deadline = window.setTimeout(() => controller.abort(), 10000);
  let disposed = false;
  setError(''); setLoading(true);
  fetch('/assets/docs.json', { credentials: 'omit', cache: 'no-store', signal: controller.signal })
   .then(async response => {
    if (!response.ok) throw Error('DOCS_UNAVAILABLE');
    const data = await response.json() as DocPage[];
    if (!Array.isArray(data) || data.length !== docPages.length || docPages.some(([id]) => !data.some(page => page.id === id && typeof page.markdown === 'string'))) throw Error('DOCS_INVALID');
    if (!disposed) setDocs(data);
   })
   .catch(() => { if (!disposed) setError('Documentation could not be read within 10 seconds. Check the local reader, then retry this read.'); })
   .finally(() => { window.clearTimeout(deadline); if (!disposed) setLoading(false); });
  return () => { disposed = true; window.clearTimeout(deadline); controller.abort(); };
 }, [retry]);
 useEffect(() => {
  const shortcut = (event: KeyboardEvent) => {
   if ((event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
    const target = event.target as HTMLElement | null;
    if (event.key === '/' && target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    event.preventDefault(); search.current?.focus(); search.current?.select();
   } else if (event.key === 'Escape' && document.activeElement === search.current && query) {
    event.preventDefault(); clearSearch();
   }
  };
  window.addEventListener('keydown', shortcut);
  return () => window.removeEventListener('keydown', shortcut);
 }, [query]);
 useLayoutEffect(() => {
  const pane = article.current;
  if (!pane || !docs.length) return;
  if (!location.hash || !scrollDocAnchor(document, location.hash)) pane.scrollTop = positions.current.get(doc) ?? 0;
  setActiveSection(pane.querySelector<HTMLElement>('h2')?.id ?? '');
  if (sidebar.current) sidebar.current.scrollTop = sidebarPosition.current;
  const anchored = () => { if (location.hash) scrollDocAnchor(document, location.hash); };
  window.addEventListener('hashchange', anchored);
  return () => window.removeEventListener('hashchange', anchored);
 }, [docs, doc]);
 useLayoutEffect(() => {
  // Use the measured shell/search chrome, rather than assuming a fixed header height.
  const measure = () => {
   const root = layout.current;
   if (!root || !root.getClientRects().length) return;
   root.style.setProperty('--docs-pane-height', Math.max(220, window.innerHeight - Math.max(0, root.getBoundingClientRect().top) - 24) + 'px');
  };
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, { passive: true });
  const observer = new ResizeObserver(measure);
  if (layout.current?.parentElement) observer.observe(layout.current.parentElement);
  return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure); observer.disconnect(); };
 }, [query, docs, error, doc]);
 const current = docs.find(page => page.id === doc), results = useMemo(() => searchDocs(docs, query), [docs, query]);
 const index = docPages.findIndex(([id]) => id === doc), contents = current ? headings(current.markdown).filter(heading => heading.level === 2) : [];
 const closeDisclosure = (event: React.MouseEvent<HTMLAnchorElement>) => { const details = event.currentTarget.closest('details'); if (details) details.open = false; };
 const pageLinks = () => [...new Set(docPages.map(([, group]) => group))].map(group => <section className="doc-nav-group" key={group}><h2>{group}</h2>{docPages.filter(page => page[1] === group).map(([id, , title]) => <AppLink key={id} href={'/docs/' + id} aria-current={id === doc ? 'page' : undefined} onClick={closeDisclosure}>{title}</AppLink>)}</section>);
 const contentsLinks = () => contents.map(heading => <AppLink key={heading.id} href={'/docs/' + doc + '#' + heading.id} aria-current={activeSection === heading.id ? 'location' : undefined} onClick={closeDisclosure}>{safe(heading.text)}</AppLink>);
 const rememberArticle = (pane: HTMLDivElement) => {
  positions.current.set(doc, pane.scrollTop);
  const top = pane.getBoundingClientRect().top + 48;
  let currentHeading = pane.querySelector<HTMLElement>('h2')?.id ?? '';
  for (const heading of pane.querySelectorAll<HTMLElement>('h2')) {
   if (heading.getBoundingClientRect().top <= top) currentHeading = heading.id;
   else break;
  }
  setActiveSection(currentHeading);
 };
 return <div className="docs-workspace">
  <div className="docs-toolbar"><div className="docs-heading"><p className="eyebrow">DOCUMENTATION</p><p>Start with a task. Keep the exact reference close.</p></div><div className="actions"><AppLink href="/workspace/new">New investigation</AppLink><AppLink href="/workspace/open">Open evidence</AppLink></div></div>
  <div className="docs-search"><div className="docs-search-input"><span className="docs-search-icon" aria-hidden="true">⌕</span><label className="visually-hidden" htmlFor="docs-query">Search all documentation</label><input ref={search} id="docs-query" type="search" value={query} maxLength={256} onChange={event => setQuery(event.target.value)} placeholder="Search commands, workflows, errors…" aria-controls="docs-search-results"/><kbd className="search-hint">/</kbd>{query && <button className="search-clear" type="button" onClick={clearSearch} aria-label="Clear documentation search">Clear</button>}</div><p>Search all {docPages.length} guides · Match multiple words · <kbd>Ctrl/⌘ K</kbd> or <kbd>/</kbd> to focus</p></div>
  {error && <p role="alert" className="notice danger">{error} {docs.length > 0 && 'The last successfully loaded reference remains readable.'} <button onClick={() => setRetry(value => value + 1)}>Retry documentation read</button></p>}
  {loading && !docs.length && <p role="status">Loading documentation…</p>}
  {query.trim() && <section id="docs-search-results" className="doc-search-results" aria-labelledby="docs-results-title"><div className="docs-results-heading"><div><p className="eyebrow">DOCUMENTATION INDEX</p><h2 id="docs-results-title">Results for <span>{safe(query)}</span></h2></div><p role="status" aria-live="polite">{!docs.length && loading ? 'Waiting for documentation…' : results.length === 100 ? 'Showing first 100 matches · refine your search' : `${results.length} ${results.length === 1 ? 'section' : 'sections'}`}</p></div>{results.map((result, i) => <article key={result.page + ':' + result.anchor}><AppLink href={'/docs/' + result.page + '#' + result.anchor}><span className="search-result-page">{result.title}</span><span className="search-result-divider" aria-hidden="true">/</span><strong>{safe(result.section)}</strong><span className="search-result-arrow" aria-hidden="true">↗</span></AppLink><p>{highlighted(result.snippet, query)}</p></article>)}{!results.length && docs.length > 0 && <p className="search-empty">No sections match <strong>{safe(query)}</strong>. Try fewer words, a command such as <code>--no-ai</code>, or an error code.</p>}{!docs.length && error && <p>Search is unavailable until the documentation read succeeds.</p>}</section>}
  <details className="doc-mobile-nav"><summary>Browse documentation · {docPages[index]?.[2]}</summary><nav aria-label="Documentation pages on small screens">{pageLinks()}</nav></details>
  <div className="doc-layout" ref={layout}>
   <aside className="doc-sidebar" aria-label="Documentation pages" ref={sidebar} onScroll={event => { sidebarPosition.current = event.currentTarget.scrollTop; }}>{pageLinks()}</aside>
   <div id="doc-page-scroll" className="doc-page" ref={article} onScroll={event => rememberArticle(event.currentTarget)} tabIndex={0} role="region" aria-label="Documentation article">
    {current && <>
     {contents.length > 0 && <details className="doc-mobile-toc" key={doc}><summary>On this page</summary><nav aria-label="On this page on small screens">{contentsLinks()}</nav></details>}
     <article className="doc-article"><Markdown text={current.markdown} page={doc}/></article>
     <nav className="doc-sequence" aria-label="Documentation sequence">{docPages[index - 1] && <AppLink href={'/docs/' + docPages[index - 1]![0]}><span>Previous</span>{docPages[index - 1]![2]}</AppLink>}{docPages[index + 1] && <AppLink href={'/docs/' + docPages[index + 1]![0]}><span>Next</span>{docPages[index + 1]![2]}</AppLink>}</nav>
     <details className="doc-source"><summary>About this reference</summary><p>Built from <code>{current.source}</code>. It is bundled with this local reader. Rebuild the application after changing its documentation sources.</p><AppLink href="/docs/reference/browser">Browser technical reference</AppLink></details>
    </>}
   </div>
   <nav className="doc-toc" aria-label="On this page"><h2>On this page</h2>{contentsLinks()}</nav>
  </div>
 </div>;
}
