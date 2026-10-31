import { AppLink } from './link.js';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
export function Documentation({ doc = 'start/quickstart' }: { doc?: DocId }) {
 const [docs,setDocs]=useState<DocPage[]>([]),[query,setQuery]=useState(''),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{const c=new AbortController(); setError('');fetch('/assets/docs.json',{credentials:'omit',cache:'no-store',signal:c.signal}).then(r=>{if(!r.ok)throw Error('DOCS_UNAVAILABLE');return r.json() as Promise<DocPage[]>;}).then(d=>{if(!c.signal.aborted)setDocs(d);}).catch(()=>{if(!c.signal.aborted)setError('Documentation unavailable. Check the local reader and retry.');});return()=>c.abort();},[retry]);
 const article=useRef<HTMLDivElement>(null), positions=useRef(new Map<DocId,number>());
 useLayoutEffect(()=>{
  const pane=article.current;if(!pane||!docs.length)return;
  if(!location.hash||!scrollDocAnchor(document,location.hash))pane.scrollTop=positions.current.get(doc)??0;
  const anchored=()=>{if(location.hash)scrollDocAnchor(document,location.hash);};
  window.addEventListener('hashchange',anchored);
  return()=>window.removeEventListener('hashchange',anchored);
 },[docs,doc]);
 const current=docs.find(d=>d.id===doc),results=searchDocs(docs,query),index=docPages.findIndex(([id])=>id===doc);
 return <><div className="section-intro"><p className="eyebrow">DOCUMENTATION / LOCAL REFERENCE</p><p>Guided tasks, current CLI reference and evidence limits. No analysis starts here.</p><div className="actions"><AppLink href="/workspace/new">New investigation</AppLink><AppLink href="/workspace/open">Open saved evidence</AppLink></div></div><label className="search">Search all documentation <input type="search" value={query} maxLength={256} onChange={e=>setQuery(e.target.value)} placeholder="--source-archive, exit 2, SESSION_DENIED"/></label>
 {error&&<p role="alert">{error} <button onClick={()=>setRetry(n=>n+1)}>Reload documentation</button></p>}{!docs.length&&!error&&<p role="status">Loading documentation…</p>}
 {query.trim()&&<section className="panel doc-search-results"><h2>Search results / up to 100 sections</h2><div className="panel-body"><p role="status">{results.length} matching sections. Query stays in this tab when following results.</p>{results.map((r,i)=><article key={i}><AppLink href={'/docs/'+r.page+'#'+r.anchor}>{r.title} / {safe(r.section)}</AppLink><p>{safe(r.snippet)}</p></article>)}{!results.length&&<p>Try an option, error code, “replay” or “exit 2”.</p>}<button onClick={()=>setQuery('')}>Clear search</button></div></section>}
 <div className="doc-layout"><aside aria-label="Documentation pages">{[...new Set(docPages.map(([,group])=>group))].map(group=><div key={group}><h2>{group}</h2>{docPages.filter(p=>p[1]===group).map(([id,,title])=><AppLink key={id} href={'/docs/'+id} aria-current={id===doc?'page':undefined}>{title}</AppLink>)}</div>)}</aside><div id="doc-page-scroll" className="doc-page" ref={article} onScroll={event=>positions.current.set(doc,event.currentTarget.scrollTop)}>{current&&<><div className="doc-toc"><p>On this page</p>{headings(current.markdown).filter(h=>h.level===2).map(h=><AppLink key={h.id} href={'/docs/'+doc+'#'+h.id}>{safe(h.text)}</AppLink>)}</div><section className="panel"><div className="panel-body"><Markdown text={current.markdown} page={doc}/><p className="muted">Built from {current.source}. Rebuild after repository documentation changes.</p></div></section><nav aria-label="Documentation sequence">{[docPages[index-1],docPages[index+1]].filter(Boolean).map(p=><AppLink key={p![0]} href={'/docs/'+p![0]}>{p![2]}</AppLink>)}</nav></>}</div></div></>;
}
